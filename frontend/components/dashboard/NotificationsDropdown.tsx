"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notificationService, AppNotification } from "../../services/notification.service";
import { notificationKeys } from "../../hooks/queryKeys";

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationService.getNotifications({ limit: 50 }),
    enabled: isOpen,
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
    },
  });

  if (!isOpen) return null;

  const notifications = data?.notifications || [];
  const filters = ["All", "Unread", "Wins", "Payments", "Draws"];

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "Unread") return !n.isRead;
    const typeUpper = (n.type || "").toUpperCase();
    if (activeFilter === "Wins") return typeUpper === "WIN";
    if (activeFilter === "Payments") return typeUpper === "PAYMENT";
    if (activeFilter === "Draws") return typeUpper === "DRAW" || typeUpper === "LAUNCH";
    return true;
  });

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
      return past.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    } catch {
      return "Recently";
    }
  };

  const getIconForType = (type: string) => {
    const t = (type || "").toUpperCase();
    switch (t) {
      case "WIN":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
          </svg>
        );
      case "PAYMENT":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        );
      case "LAUNCH":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m0 0L21 3m-9.75 8.25L3 21" />
          </svg>
        );
      case "DRAW":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        );
    }
  };

  const getIconColors = (type: string) => {
    const t = (type || "").toUpperCase();
    switch (t) {
      case "WIN":
        return "text-emerald-700 bg-emerald-50 border border-emerald-200";
      case "PAYMENT":
        return "text-purple-700 bg-accent-bg border border-border-medium";
      case "LAUNCH":
        return "text-primary bg-accent-bg border border-border-medium";
      case "DRAW":
        return "text-amber-700 bg-amber-50 border border-amber-200";
      default:
        return "text-text-brand bg-accent-bg border border-border";
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      onClose();
      router.push(notification.link);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
      <div className="absolute top-[52px] right-0 w-[440px] max-w-[calc(100vw-40px)] bg-surface border border-border rounded-card shadow-2xl flex flex-col z-50 animate-fadeIn overflow-hidden select-none">
        {/* Header Row */}
        <div className="flex items-center justify-between p-4 border-b border-divider bg-surface">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-[11px] font-sans transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === filter
                    ? "bg-primary border border-primary text-primary-text font-bold shadow-sm"
                    : "bg-bg border border-border text-text-secondary hover:border-border-medium hover:text-text-primary font-medium"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          {data?.unreadCount && data.unreadCount > 0 ? (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="text-[11px] font-sans font-semibold text-primary hover:underline transition-colors whitespace-nowrap ml-4 shrink-0 cursor-pointer disabled:opacity-50"
            >
              Mark all as read
            </button>
          ) : null}
        </div>

        {/* Notifications List */}
        <div className="flex flex-col max-h-[500px] overflow-y-auto divide-y divide-divider">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 gap-2 text-text-muted">
              <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 gap-2 text-center text-text-muted">
              <div className="w-10 h-10 rounded-full bg-accent-bg flex items-center justify-center text-text-muted">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
              </div>
              <span className="font-heading font-semibold text-sm text-text-primary">No notifications</span>
              <span className="font-sans text-xs text-text-muted">
                {activeFilter === "Unread"
                  ? "You have caught up with all updates!"
                  : "You do not have any notifications yet."}
              </span>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const isUnread = !notification.isRead;
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-3.5 p-3.5 hover:bg-accent-bg/40 transition-colors cursor-pointer relative ${
                    isUnread
                      ? "border-l-4 border-l-primary bg-primary/5"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${getIconColors(
                      notification.type,
                    )}`}
                  >
                    {getIconForType(notification.type)}
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="font-sans text-[13px] font-bold text-text-primary leading-tight flex items-center gap-1.5">
                      {notification.title}
                      {isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </span>
                    <span className="font-sans text-[12px] text-text-muted leading-relaxed line-clamp-2">
                      {notification.message}
                    </span>
                  </div>
                  <span className="font-sans text-[10px] text-text-muted font-medium shrink-0 mt-0.5 whitespace-nowrap">
                    {getTimeAgo(notification.createdAt)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Dropdown Footer */}
        <div className="p-3 border-t border-divider bg-surface/80 flex items-center justify-center">
          <button
            onClick={() => {
              onClose();
              router.push("/dashboard/notifications");
            }}
            className="text-xs font-sans font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>View all notifications</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
