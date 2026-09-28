"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, HostData } from "../../../services/admin.service";
import ReviewHostModal from "./ReviewHostModal";
import ConfirmBlockModal from "./ConfirmBlockModal";
import { hostKeys, adminKeys } from "../../../hooks/queryKeys";

export default function HostsTable() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHost, setSelectedHost] = useState<HostData | null>(null);
  const [blockModalHost, setBlockModalHost] = useState<HostData | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: hostKeys.adminList({ page, activeFilter, search }),
    queryFn: () =>
      adminService.getHosts({
        page,
        limit: 10,
        search,
        status: activeFilter,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: hostKeys.adminStats(),
    queryFn: () => adminService.getHostStats(),
  });

  const toggleBlockMutation = useMutation({
    mutationFn: (userId: string) => adminService.toggleBlockStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: hostKeys.adminStats() });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.usersStats() });
      queryClient.invalidateQueries({ queryKey: hostKeys.all });
      setBlockModalHost(null);
    },
  });

  const approveHostMutation = useMutation({
    mutationFn: (hostId: string) => adminService.approveHost(hostId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: hostKeys.adminStats() });
      queryClient.invalidateQueries({ queryKey: hostKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.overviewStats() });
      setIsModalOpen(false);
      setSelectedHost(null);
    },
  });

  const rejectHostMutation = useMutation({
    mutationFn: (hostId: string) => adminService.rejectHost(hostId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: hostKeys.adminStats() });
      queryClient.invalidateQueries({ queryKey: hostKeys.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.overviewStats() });
      setIsModalOpen(false);
      setSelectedHost(null);
    },
  });

  const handleExportCSV = () => {
    const hosts = data?.hosts || [];
    if (hosts.length === 0) return;

    const headers = [
      "ID",
      "Business Name",
      "Owner Name",
      "Email",
      "Plan",
      "Active Raffles",
      "Revenue (£)",
      "Status",
      "Verified",
      "Created At"
    ];

    const rows = hosts.map((host: HostData) => [
      host.id,
      host.businessName || "N/A",
      host.ownerName || "N/A",
      host.email,
      host.plan || "Free",
      host.raffles || 0,
      (host.revenue || 0).toFixed(2),
      host.isBlocked ? "Blocked" : "Active",
      host.isVerified ? "Yes" : "No",
      host.createdAt
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `hosts_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReview = (host: HostData) => {
    setSelectedHost(host);
    setIsModalOpen(true);
  };

  const getStatusPills = (host: HostData) => {
    return (
      <div className="flex flex-col items-center gap-1">
        {host.isVerified ? (
          <span className="px-2.5 py-0.5 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-bold text-[10px] shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Verified
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-badge border border-amber-200 bg-amber-50 text-amber-700 font-sans font-bold text-[10px] shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Pending
          </span>
        )}
        {host.isBlocked && (
          <span className="px-2 py-0.5 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[9px] shadow-sm">
            Blocked
          </span>
        )}
      </div>
    );
  };

  const getPlanPill = (plan: string) => {
    if (plan === "Pending Approval") {
      return (
        <span className="px-3 py-1 rounded-badge border border-amber-200 bg-amber-50 text-amber-700 font-sans font-semibold text-[10px] shadow-sm">
          {plan}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-badge border border-border-medium bg-accent-bg text-text-brand font-sans font-semibold text-[10px] shadow-sm">
        {plan || "Free"}
      </span>
    );
  };

  const filterTabs = [
    { key: "All", label: "All Hosts", count: stats?.totalHosts },
    { key: "Pending", label: "Pending Approval", count: stats?.pendingHosts, alert: (stats?.pendingHosts || 0) > 0 },
    { key: "Active", label: "Verified & Active", count: stats?.activeHosts },
    { key: "Blocked", label: "Blocked", count: stats?.blockedHosts },
  ];

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border shadow-card">
        {/* Left: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          {/* Search Input */}
          <div className="flex items-center h-[40px] w-full sm:w-[320px] bg-bg border border-border rounded-button px-3 focus-within:border-primary transition-colors">
            <svg
              className="w-4 h-4 text-text-muted shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by business name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-text-primary text-[13px] placeholder:text-text-muted w-full ml-2 font-sans"
            />
          </div>

          {/* Filter Tabs with Counts */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {filterTabs.map((tab) => {
              const isSelected = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveFilter(tab.key);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-badge text-[12px] font-sans font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary border-primary text-primary-text font-bold shadow-sm"
                      : tab.alert
                        ? "bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100"
                        : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : tab.alert
                            ? "bg-amber-200 text-amber-900"
                            : "bg-accent-bg text-text-muted"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Export CSV */}
        <button
          onClick={handleExportCSV}
          disabled={!data?.hosts || data.hosts.length === 0}
          className="group h-[40px] px-4 bg-accent-bg border border-border-medium hover:bg-primary rounded-button flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
        >
          <svg
            className="w-4 h-4 text-text-brand group-hover:text-white transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <span className="font-sans font-semibold text-[13px] text-text-brand group-hover:text-white transition-colors">
            Export CSV
          </span>
        </button>
      </div>

      {/* Table Container */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden shadow-card overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-accent-bg/50">
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[26%]">
                HOST & BUSINESS
              </th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[19%]">
                EMAIL & OWNER
              </th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-center">
                PLAN
              </th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">
                RAFFLES
              </th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">
                BALANCE
              </th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[11%] text-center">
                STATUS
              </th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-right">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-divider last:border-b-0">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded-full bg-accent-bg shrink-0" />
                      <div className="h-4 w-32 bg-accent-bg rounded" />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-40 bg-accent-bg rounded animate-pulse" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-6 w-24 bg-accent-bg rounded-full animate-pulse mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-4 w-10 bg-accent-bg rounded animate-pulse mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-4 w-16 bg-accent-bg rounded animate-pulse mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-6 w-16 bg-accent-bg rounded-full animate-pulse mx-auto" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-5 h-5 bg-accent-bg rounded animate-pulse" />
                      <div className="w-5 h-5 bg-accent-bg rounded animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))
            ) : data?.hosts?.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-muted font-sans text-sm font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">🔍</span>
                    <span>No hosts match your selected filters.</span>
                  </div>
                </td>
              </tr>
            ) : (
              data?.hosts?.map((host: HostData, i: number) => {
                const isImageLogo = Boolean(
                  host.avatarUrl &&
                    (host.avatarUrl.startsWith("http://") ||
                      host.avatarUrl.startsWith("https://") ||
                      host.avatarUrl.startsWith("/") ||
                      host.avatarUrl.startsWith("data:") ||
                      host.avatarUrl.includes("/uploads/")),
                );
                const logoSrc = isImageLogo
                  ? host.avatarUrl!.startsWith("http") ||
                    host.avatarUrl!.startsWith("/") ||
                    host.avatarUrl!.startsWith("data:")
                    ? host.avatarUrl!
                    : `/${host.avatarUrl}`
                  : null;

                const initials = host.businessName
                  ? host.businessName
                      .split(" ")
                      .filter(Boolean)
                      .map((w: string) => w[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "H";

                return (
                  <tr
                    key={host.id}
                    className={`${
                      i !== data.hosts.length - 1 ? "border-b border-divider" : ""
                    } hover:bg-accent-bg/30 transition-colors`}
                  >
                    {/* Host Business Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                          {logoSrc ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={logoSrc}
                              alt={host.businessName || "Host"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-heading font-bold text-[12px] text-text-brand">
                              {initials}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <button
                            onClick={() => handleReview(host)}
                            className="text-left font-sans font-bold text-[13px] text-text-primary hover:text-text-brand transition-colors cursor-pointer truncate"
                          >
                            {host.businessName || "Unnamed Business"}
                          </button>
                          {host.location && (
                            <span className="font-sans text-[11px] text-text-muted truncate">
                              📍 {host.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email & Owner Column */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-sans text-[13px] text-text-primary font-medium truncate">
                          {host.email}
                        </span>
                        {host.ownerName && host.ownerName !== "Not specified" && (
                          <span className="font-sans text-[11px] text-text-muted">
                            👤 {host.ownerName}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-4 px-6 text-center">
                      {getPlanPill(host.plan)}
                    </td>

                    {/* Raffles */}
                    <td className="py-4 px-6 text-center">
                      <span className="font-sans font-semibold text-[13px] text-text-primary">
                        {host.raffles}
                      </span>
                    </td>

                    {/* Revenue / Balance */}
                    <td className="py-4 px-6 text-center">
                      <span className="font-sans font-bold text-[13px] text-text-brand">
                        £{Number(host.revenue || host.walletBalance || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      {getStatusPills(host)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2.5 font-sans">
                        {!host.isVerified && (
                          <>
                            <button
                              onClick={() => approveHostMutation.mutate(host.id)}
                              disabled={
                                approveHostMutation.isPending ||
                                rejectHostMutation.isPending
                              }
                              className="text-emerald-600 hover:text-emerald-700 transition-all flex items-center justify-center shrink-0 cursor-pointer p-1"
                              title="Approve Host"
                            >
                              {approveHostMutation.isPending &&
                              approveHostMutation.variables === host.id ? (
                                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg
                                  className="w-4.5 h-4.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m4.5 12.75 6 6 9-13.5"
                                  />
                                </svg>
                              )}
                            </button>

                            <button
                              onClick={() => rejectHostMutation.mutate(host.id)}
                              disabled={
                                approveHostMutation.isPending ||
                                rejectHostMutation.isPending
                              }
                              className="text-red-600 hover:text-red-700 transition-all flex items-center justify-center shrink-0 cursor-pointer p-1"
                              title="Reject Host"
                            >
                              {rejectHostMutation.isPending &&
                              rejectHostMutation.variables === host.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg
                                  className="w-4.5 h-4.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18 18 6M6 6l12 12"
                                  />
                                </svg>
                              )}
                            </button>
                          </>
                        )}

                        {/* View & Review Details */}
                        <button
                          onClick={() => handleReview(host)}
                          className="px-2.5 py-1 rounded bg-accent-bg border border-border text-text-primary hover:border-primary hover:text-text-brand transition-all text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Review all host details in 3-tab view"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                          <span>Review</span>
                        </button>

                        {/* Block / Unblock Toggle */}
                        <button
                          onClick={() => setBlockModalHost(host)}
                          disabled={toggleBlockMutation.isPending}
                          className={`transition-colors cursor-pointer p-1 ${
                            host.isBlocked
                              ? "text-red-600 hover:text-emerald-600"
                              : "text-text-muted hover:text-red-600"
                          }`}
                          title={host.isBlocked ? "Unblock Host" : "Block Host"}
                        >
                          {host.isBlocked ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface border border-border rounded-card px-6 py-4 shadow-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-[13px] font-sans font-semibold text-text-primary disabled:text-text-muted hover:text-text-brand transition-colors disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-[13px] font-sans text-text-muted font-medium">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="text-[13px] font-sans font-semibold text-text-primary disabled:text-text-muted hover:text-text-brand transition-colors disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* Review Host 3-Tab Modal */}
      <ReviewHostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHost(null);
        }}
        host={selectedHost}
        onApprove={(hostId) => approveHostMutation.mutate(hostId)}
        isApproveLoading={approveHostMutation.isPending}
        onReject={(hostId) => rejectHostMutation.mutate(hostId)}
        isRejectLoading={rejectHostMutation.isPending}
        onToggleBlock={(h) => {
          setBlockModalHost(h);
          setIsModalOpen(false);
        }}
      />

      {/* Confirm Block / Unblock Modal */}
      <ConfirmBlockModal
        isOpen={!!blockModalHost}
        onClose={() => setBlockModalHost(null)}
        onConfirm={() =>
          blockModalHost && toggleBlockMutation.mutate(blockModalHost.userId)
        }
        isLoading={toggleBlockMutation.isPending}
        isBlocked={blockModalHost?.isBlocked ?? false}
        userIdentifier={
          blockModalHost?.businessName || blockModalHost?.email || ""
        }
      />
    </div>
  );
}
