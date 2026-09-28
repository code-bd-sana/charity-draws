"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { adminService, HostData } from "../../../services/admin.service";
import { formatUKDate, formatUKDateTime } from "../../../lib/uk-date";

interface ReviewHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: HostData | null;
  onApprove?: (hostId: string) => void;
  isApproveLoading?: boolean;
  onReject?: (hostId: string) => void;
  isRejectLoading?: boolean;
  onToggleBlock?: (host: HostData) => void;
  isToggleBlockLoading?: boolean;
}

export default function ReviewHostModal({
  isOpen,
  onClose,
  host,
  onApprove,
  isApproveLoading = false,
  onReject,
  isRejectLoading = false,
  onToggleBlock,
  isToggleBlockLoading = false,
}: ReviewHostModalProps) {
  const [activeTab, setActiveTab] = useState<"business" | "owner" | "activity">("business");

  // Fetch full host details with deep relations (raffles, subscriptions, withdrawals)
  const { data: fullHostDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["admin", "host-detail", host?.id],
    queryFn: () => adminService.getHostDetails(host!.id),
    enabled: isOpen && !!host?.id,
  });

  if (!isOpen || !host) return null;

  // Merge quick host data with full details when available
  const user = fullHostDetails?.user || host;
  const businessName = fullHostDetails?.businessName || host.businessName || "Unnamed Business";
  const slug = fullHostDetails?.slug || host.slug;
  const logo = fullHostDetails?.user?.avatarUrl || host.avatarUrl;
  const bio = fullHostDetails?.bio || host.bio;
  const hostPhone = fullHostDetails?.phone || host.phone;
  const hostAddress = fullHostDetails?.address || host.address;
  const location = fullHostDetails?.address || fullHostDetails?.user?.location || host.location;
  const isVerified = fullHostDetails?.isVerified ?? host.isVerified;
  const isBlocked = fullHostDetails?.user?.isBlocked ?? host.isBlocked;
  const plan = fullHostDetails?.subscriptions?.[0]?.plan?.name || host.plan || "Free";
  const raffles = fullHostDetails?.raffles || host.recentRaffles || [];
  const withdrawals = fullHostDetails?.withdrawals || [];
  const walletBalance = fullHostDetails?.walletBalance !== undefined 
    ? Number(fullHostDetails.walletBalance) 
    : host.walletBalance || 0;

  const isImageLogo = Boolean(
    logo &&
      (logo.startsWith("http://") ||
        logo.startsWith("https://") ||
        logo.startsWith("/") ||
        logo.startsWith("data:") ||
        logo.includes("/uploads/")),
  );

  const logoSrc = isImageLogo
    ? logo!.startsWith("http") || logo!.startsWith("/") || logo!.startsWith("data:")
      ? logo!
      : `/${logo}`
    : null;

  const initials = businessName
    ? businessName
        .split(" ")
        .filter(Boolean)
        .map((w: string) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "H";

  const ownerFullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    host.ownerName ||
    "Not specified";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:max-w-[720px] max-h-[90vh] bg-surface border border-border rounded-card shadow-2xl z-50 animate-fadeIn flex flex-col select-none overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border bg-accent-bg/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-[52px] h-[52px] rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              {logoSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoSrc} alt={businessName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading font-bold text-text-brand text-[18px]">
                  {initials}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-heading font-bold text-[18px] sm:text-[20px] text-text-primary leading-tight">
                  {businessName}
                </h2>
                {isVerified ? (
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Verified Host
                  </span>
                ) : (
                  <span className="bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Pending Approval
                  </span>
                )}
                {isBlocked && (
                  <span className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wide shadow-sm">
                    Blocked
                  </span>
                )}
              </div>
              <span className="font-sans text-[12px] text-text-muted flex items-center gap-2">
                <span>{host.email}</span>
                {slug && (
                  <>
                    <span>•</span>
                    <Link
                      href={`/hosts/${slug}`}
                      target="_blank"
                      className="text-primary hover:underline flex items-center gap-0.5 font-medium"
                      title="Preview public profile"
                    >
                      <span>/hosts/{slug}</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </Link>
                  </>
                )}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-2 rounded-button hover:bg-accent-bg cursor-pointer"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 3 Tabs Navigation Bar */}
        <div className="flex items-center px-6 border-b border-border bg-surface shrink-0 gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("business")}
            className={`py-3.5 text-[13px] font-sans font-semibold transition-all border-b-[2px] -mb-[1px] whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "business"
                ? "border-primary text-text-brand font-bold"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span>🏢</span>
            <span>Business Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("owner")}
            className={`py-3.5 text-[13px] font-sans font-semibold transition-all border-b-[2px] -mb-[1px] whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "owner"
                ? "border-primary text-text-brand font-bold"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span>👤</span>
            <span>Owner Account</span>
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`py-3.5 text-[13px] font-sans font-semibold transition-all border-b-[2px] -mb-[1px] whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "activity"
                ? "border-primary text-text-brand font-bold"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span>🎟️</span>
            <span>Competitions & Activity</span>
            {raffles.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent-bg border border-border text-text-brand font-bold">
                {raffles.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content (Scrollable Body) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 flex flex-col gap-6 font-sans">
          {/* TAB 1: BUSINESS PROFILE */}
          {activeTab === "business" && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              {/* Bio / Description Box */}
              <div className="bg-bg border border-border rounded-card p-4 flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Business Bio / Description
                </span>
                <p className="text-[13px] text-text-primary leading-relaxed font-medium">
                  {bio || (
                    <span className="text-text-muted italic">
                      No public bio provided by this host yet.
                    </span>
                  )}
                </p>
              </div>

              {/* Business Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Business Name
                  </span>
                  <span className="text-[14px] font-semibold text-text-primary">
                    {businessName}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Public Slug
                  </span>
                  <span className="text-[14px] font-semibold text-text-brand truncate">
                    {slug || "No slug generated"}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Business Contact Phone
                  </span>
                  <span className="text-[14px] font-medium text-text-primary">
                    {hostPhone || "Not provided"}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Operating Jurisdiction / Location
                  </span>
                  <span className="text-[14px] font-medium text-text-primary truncate">
                    📍 {location || "United Kingdom"}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1 sm:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Registered Business Address
                  </span>
                  <span className="text-[13px] font-medium text-text-primary">
                    {hostAddress || location || "No physical business address provided"}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Wallet Balance
                  </span>
                  <span className="text-[16px] font-bold font-heading text-text-brand">
                    £{walletBalance.toFixed(2)}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Host Registration Date
                  </span>
                  <span className="text-[13px] font-medium text-text-primary">
                    {formatUKDate(host.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OWNER ACCOUNT INFO */}
          {activeTab === "owner" && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Account Owner Name
                  </span>
                  <span className="text-[14px] font-semibold text-text-primary">
                    {ownerFullName}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Email Address
                  </span>
                  <span className="text-[14px] font-semibold text-text-brand break-all">
                    {user?.email || host.email}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Email Verification Status
                  </span>
                  <span className="text-[13px] font-semibold flex items-center gap-1.5">
                    {user?.isEmailVerified ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span>✓</span> Verified Email
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <span>⚠</span> Pending Verification
                      </span>
                    )}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Account Role
                  </span>
                  <span className="text-[13px] font-bold text-text-primary uppercase">
                    {user?.role || host.role || "HOST"}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Personal Phone
                  </span>
                  <span className="text-[13px] font-medium text-text-primary">
                    {user?.phone || host.phone || "Not provided"}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Account Status
                  </span>
                  <span className="text-[13px] font-semibold">
                    {isBlocked ? (
                      <span className="text-red-600">Blocked / Suspended</span>
                    ) : (
                      <span className="text-emerald-600">Active & In Good Standing</span>
                    )}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1 sm:col-span-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Personal / User Address
                  </span>
                  <span className="text-[13px] font-medium text-text-primary">
                    {user?.address || user?.location || "No personal address registered"}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    User Registered Since
                  </span>
                  <span className="text-[13px] font-medium text-text-primary">
                    {formatUKDateTime(user?.createdAt || host.userCreatedAt || host.createdAt)}
                  </span>
                </div>

                <div className="bg-surface border border-border rounded-button p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    User Database ID
                  </span>
                  <span className="text-[11px] font-mono text-text-muted break-all">
                    {user?.id || host.userId}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPETITIONS & ACTIVITY */}
          {activeTab === "activity" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-bg border border-border rounded-card p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-text-muted">
                    Active Plan
                  </span>
                  <span className="font-heading font-bold text-[14px] text-text-primary">
                    {plan}
                  </span>
                </div>

                <div className="bg-bg border border-border rounded-card p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-text-muted">
                    Total Draws
                  </span>
                  <span className="font-heading font-bold text-[16px] text-text-brand">
                    {host.raffles || raffles.length}
                  </span>
                </div>

                <div className="bg-bg border border-border rounded-card p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-text-muted">
                    Wallet
                  </span>
                  <span className="font-heading font-bold text-[16px] text-emerald-600">
                    £{walletBalance.toFixed(2)}
                  </span>
                </div>

                <div className="bg-bg border border-border rounded-card p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-text-muted">
                    Lifetime Sales
                  </span>
                  <span className="font-heading font-bold text-[16px] text-text-primary">
                    £{(host.revenue || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Raffles List */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-[14px] text-text-primary">
                    Recent Competitions
                  </h4>
                  <span className="text-[11px] text-text-muted font-medium">
                    {raffles.length} total
                  </span>
                </div>

                {raffles.length > 0 ? (
                  <div className="border border-border rounded-card overflow-hidden">
                    <table className="w-full text-left border-collapse text-[12px]">
                      <thead>
                        <tr className="bg-accent-bg/60 border-b border-divider font-bold text-text-muted">
                          <th className="py-2.5 px-3">Title</th>
                          <th className="py-2.5 px-3">Price</th>
                          <th className="py-2.5 px-3">Tickets Sold</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {raffles.map((r: any) => (
                          <tr key={r.id} className="border-b border-divider last:border-b-0 hover:bg-accent-bg/20">
                            <td className="py-2.5 px-3 font-semibold text-text-primary truncate max-w-[200px]">
                              {r.title}
                            </td>
                            <td className="py-2.5 px-3 text-text-brand font-medium">
                              £{Number(r.pricePerTicket || 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-text-muted">
                              {r.ticketsSold || 0} / {r.totalTickets || 0}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  r.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : r.status === "ENDED"
                                      ? "bg-gray-100 text-gray-700"
                                      : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-bg border border-border rounded-card p-6 text-center text-text-muted text-[13px]">
                    No competitions created by this host yet.
                  </div>
                )}
              </div>

              {/* Withdrawals List (if any) */}
              {withdrawals.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-heading font-bold text-[14px] text-text-primary">
                    Recent Withdrawals
                  </h4>
                  <div className="border border-border rounded-card overflow-hidden">
                    <table className="w-full text-left border-collapse text-[12px]">
                      <thead>
                        <tr className="bg-accent-bg/60 border-b border-divider font-bold text-text-muted">
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Method</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.map((w: any) => (
                          <tr key={w.id} className="border-b border-divider last:border-b-0">
                            <td className="py-2.5 px-3 font-bold text-text-primary">
                              £{Number(w.amount).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-text-muted">
                              {w.payoutMethod || "Bank Transfer"}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface border border-border">
                                {w.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-text-muted">
                              {formatUKDate(w.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 sm:p-6 border-t border-border bg-accent-bg/30 shrink-0">
          {/* Left Actions: Public View & Block */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {slug && (
              <Link
                href={`/hosts/${slug}`}
                target="_blank"
                className="h-[40px] px-3.5 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary font-sans font-semibold text-[13px] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View Public Page</span>
                <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </Link>
            )}

            {onToggleBlock && (
              <button
                onClick={() => onToggleBlock(host)}
                disabled={isToggleBlockLoading}
                className={`h-[40px] px-3.5 rounded-button border font-sans font-semibold text-[13px] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                  isBlocked
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    : "bg-surface border-border text-red-600 hover:bg-red-50 hover:border-red-200"
                }`}
              >
                {isBlocked ? "Unblock Host" : "Block Host"}
              </button>
            )}
          </div>

          {/* Right Actions: Approve, Reject, Close */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {!isVerified && onApprove && (
              <button
                onClick={() => onApprove(host.id)}
                disabled={isApproveLoading || isRejectLoading}
                className="flex-1 sm:flex-initial h-[40px] px-5 rounded-button bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isApproveLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>Approve Host</span>
                  </>
                )}
              </button>
            )}

            {!isVerified && onReject && (
              <button
                onClick={() => onReject(host.id)}
                disabled={isApproveLoading || isRejectLoading}
                className="flex-1 sm:flex-initial h-[40px] px-4 rounded-button bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white text-red-700 font-sans font-bold text-[13px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isRejectLoading ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Reject</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="h-[40px] px-4 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary font-sans font-semibold text-[13px] transition-all cursor-pointer shadow-sm flex items-center justify-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
