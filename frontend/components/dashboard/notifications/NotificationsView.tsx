"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { notificationService, AppNotification } from "../../../services/notification.service";
import { notificationKeys } from "../../../hooks/queryKeys";

export default function NotificationsView() {
  const [filter, setFilter] = useState<string>("All");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationService.getNotifications({ limit: 100 }),
    refetchInterval: 15000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark all as read");
    },
  });

  const clearReadMutation = useMutation({
    mutationFn: () => notificationService.clearRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Cleared read notifications");
    },
    onError: () => {
      toast.error("Failed to clear read notifications");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notification removed");
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });

  const notifications = data?.notifications || [];

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "Unread") return !n.isRead;
    const typeUpper = (n.type || "").toUpperCase();
    if (filter === "Competitions") {
      return typeUpper === "DRAW" || typeUpper === "LAUNCH" || typeUpper === "WIN";
    }
    if (filter === "Payouts") {
      return typeUpper === "PAYMENT";
    }
    if (filter === "System") {
      return typeUpper === "SYSTEM" || typeUpper === "INFO";
    }
    return true;
  });

  const filterTabs = [
    { key: "All", label: "All Activity", count: notifications.length },
    { key: "Unread", label: "Unread", count: data?.unreadCount || 0 },
    { key: "Competitions", label: "Draws & Wins" },
    { key: "Payouts", label: "Payments & Sales" },
    { key: "System", label: "System Alerts" },
  ];

  const getBadgeStyle = (type: string) => {
    const t = (type || "").toUpperCase();
    switch (t) {
      case "WIN":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: "🏆",
        };
      case "PAYMENT":
        return {
          bg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          icon: "💳",
        };
      case "LAUNCH":
        return {
          bg: "bg-primary/10 text-primary border-primary/20",
          icon: "🚀",
        };
      case "DRAW":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: "🎯",
        };
      default:
        return {
          bg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          icon: "ℹ️",
        };
    }
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return past.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border rounded-card p-6 shadow-card">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl text-text-primary">
              Notifications & Activity
            </h1>
            {data?.unreadCount && data.unreadCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-text shadow-sm">
                {data.unreadCount} new
              </span>
            ) : null}
          </div>
          <p className="font-sans text-xs text-text-muted">
            Stay updated with real-time alerts regarding ticket entries, draw completions, payouts, and system notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && notifications.some((n) => n.isRead) ? (
            <button
              onClick={() => clearReadMutation.mutate()}
              disabled={clearReadMutation.isPending}
              className="h-10 px-4 rounded-button bg-accent-bg hover:bg-accent-bg/80 text-text-secondary hover:text-text-primary border border-border font-sans font-semibold text-xs transition-colors shrink-0 shadow-sm cursor-pointer disabled:opacity-50"
            >
              Clear Read
            </button>
          ) : null}

          {data?.unreadCount && data.unreadCount > 0 ? (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="h-10 px-4 rounded-button bg-primary hover:bg-primary-hover text-primary-text font-sans font-semibold text-xs transition-colors shrink-0 shadow-sm cursor-pointer disabled:opacity-50"
            >
              Mark all as read
            </button>
          ) : null}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map((tab) => {
          const isSelected = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-badge text-xs font-sans font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? "bg-primary border-primary text-primary-text font-bold shadow-sm"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-bg text-text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-card gap-3">
            <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-sans text-sm text-text-muted">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-card text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent-bg flex items-center justify-center text-xl">
              🔔
            </div>
            <h3 className="font-heading font-bold text-base text-text-primary">
              No Notifications Found
            </h3>
            <p className="font-sans text-xs text-text-muted max-w-sm">
              {filter === "Unread"
                ? "You have no unread notifications. You're all caught up!"
                : "There are currently no notifications matching this filter."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif: AppNotification) => {
            const isUnread = !notif.isRead;
            const badge = getBadgeStyle(notif.type);

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (isUnread) markAsReadMutation.mutate(notif.id);
                  if (notif.link) router.push(notif.link);
                }}
                className={`bg-surface border rounded-card p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                  notif.link ? "cursor-pointer hover:border-primary/60" : ""
                } ${
                  isUnread
                    ? "border-primary/40 bg-primary/[0.02]"
                    : "border-border hover:border-border-medium"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg shrink-0 ${badge.bg}`}
                  >
                    {badge.icon}
                  </div>

                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-sm text-text-primary">
                        {notif.title}
                      </span>
                      {isUnread && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-text">
                          NEW
                        </span>
                      )}
                      <span className="font-sans text-[11px] text-text-muted">
                        • {getTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="font-sans text-xs text-text-muted leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 shrink-0 self-end sm:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {notif.link ? (
                    <Link
                      href={notif.link}
                      onClick={() => {
                        if (isUnread) markAsReadMutation.mutate(notif.id);
                      }}
                      className="px-3 py-1.5 rounded-button text-xs font-sans font-semibold bg-accent-bg border border-border-medium hover:bg-primary hover:text-white transition-colors text-text-primary"
                    >
                      View Details →
                    </Link>
                  ) : null}

                  {isUnread && (
                    <button
                      onClick={() => markAsReadMutation.mutate(notif.id)}
                      title="Mark as read"
                      className="p-2 rounded-button text-text-muted hover:text-text-primary hover:bg-accent-bg transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={() => deleteMutation.mutate(notif.id)}
                    title="Delete notification"
                    className="p-2 rounded-button text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
