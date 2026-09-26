"use client";

import React, { useState } from "react";
import { formatUKDateTime, formatUKDate, getRaffleTimingStatus } from "../../../lib/uk-date";
import { cn, formatCurrency } from "../../../lib/utils";

interface AdminRaffleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffle: any;
  onApprove: (id: string) => void | Promise<void>;
  onReject: (id: string, title: string) => void;
  isApproving: boolean;
}

type ModalTab = "overview" | "pricing" | "schedule" | "instantWins" | "host";

export default function AdminRaffleDetailModal({
  isOpen,
  onClose,
  raffle,
  onApprove,
  onReject,
  isApproving,
}: AdminRaffleDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("overview");
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  if (!isOpen || !raffle) return null;

  const host = raffle.host;
  const user = host?.user;
  const activeSub = host?.subscriptions?.[0];
  const isPaidPlan =
    Boolean(activeSub?.plan && (Number(activeSub.plan.price) > 0 || activeSub.plan.name?.toLowerCase().includes("pro") || activeSub.plan.name?.toLowerCase().includes("premium")));
  const planName = activeSub?.plan?.name || (isPaidPlan ? "Pro" : "Free");
  const commissionRate = isPaidPlan ? 10.0 : 15.0;

  const ticketPrice = Number(raffle.pricePerTicket || 0);
  const totalTickets = Number(raffle.totalTickets || 0);
  const grossRevenue = ticketPrice * totalTickets;
  const platformFee = grossRevenue * (commissionRate / 100);
  const netPayout = grossRevenue - platformFee;

  const instantWins = raffle.instantWins || [];
  const totalInstantWinsRRP = instantWins.reduce(
    (sum: number, iw: any) => sum + Number(iw.rrpValue || 0),
    0
  );

  const timing = getRaffleTimingStatus(raffle.startDate, raffle.endDate);

  const getHostInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (host?.businessName) return host.businessName.slice(0, 2).toUpperCase();
    return "H";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[920px] max-h-[92vh] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col font-sans select-none overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-accent-bg/30 shrink-0">
          <div className="flex flex-col gap-1 min-w-0 pr-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-badge bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold uppercase tracking-wider">
                Pending Approval
              </span>
              {raffle.category && (
                <span className="px-2.5 py-0.5 rounded-badge bg-elevated text-text-brand border border-border-medium text-[11px] font-semibold">
                  {raffle.category}
                </span>
              )}
              <span className="text-[12px] text-text-muted font-medium">
                ID: <span className="font-mono text-[11px] text-text-primary">{raffle.id}</span>
              </span>
            </div>
            <h2 className="font-heading font-bold text-[18px] sm:text-[20px] text-text-primary truncate">
              {raffle.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface border border-border hover:bg-accent-bg text-text-muted hover:text-text-primary transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 px-6 pt-3 pb-2 border-b border-border bg-surface shrink-0 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-3.5 py-2 rounded-button text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "overview"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/50"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3 7.5A2.25 2.25 0 0 1 5.25 5h13.5A2.25 2.25 0 0 1 21 7.5v9a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 16.5v-9z" />
            </svg>
            Competition & Prize
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={cn(
              "px-3.5 py-2 rounded-button text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "pricing"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/50"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            Pricing & Economics
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={cn(
              "px-3.5 py-2 rounded-button text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "schedule"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/50"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            Schedule & Draw
          </button>

          <button
            onClick={() => setActiveTab("instantWins")}
            className={cn(
              "px-3.5 py-2 rounded-button text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "instantWins"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/50"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .982-3.172M12 3a4.5 4.5 0 0 0-4.5 4.5c0 1.298.552 2.47 1.439 3.29m6.122 0A4.478 4.478 0 0 0 16.5 7.5 4.5 4.5 0 0 0 12 3z" />
            </svg>
            Instant Wins
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[11px] font-bold",
                activeTab === "instantWins"
                  ? "bg-white text-primary"
                  : "bg-elevated text-text-brand"
              )}
            >
              {instantWins.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("host")}
            className={cn(
              "px-3.5 py-2 rounded-button text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "host"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/50"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Host Profile (Creator)
            {host?.isVerified && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            )}
          </button>
        </div>

        {/* Tab Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-bg/50">
          
          {/* TAB 1: OVERVIEW & PRIZE */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              
              {/* Main Prize & Image Banner */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-surface p-5 rounded-card border border-border">
                
                {/* Cover Image */}
                <div className="md:col-span-5 flex flex-col gap-2">
                  <div className="relative w-full h-[220px] bg-accent-bg border border-border rounded-button overflow-hidden flex items-center justify-center group">
                    {raffle.mainImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={raffle.mainImage}
                          alt={raffle.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() => setIsImageZoomed(true)}
                          className="absolute bottom-2 right-2 px-2.5 py-1 rounded-button bg-black/70 hover:bg-black text-white text-[11px] font-semibold backdrop-blur-sm transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607zM10.5 7.5v6m3-3h-6" />
                          </svg>
                          Enlarge
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-text-muted">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" />
                        </svg>
                        <span className="text-[12px] font-medium">No cover image uploaded</span>
                      </div>
                    )}
                  </div>
                  {raffle.slug && (
                    <span className="text-[12px] text-text-muted font-medium truncate">
                      Slug: <span className="font-mono text-text-primary">/{raffle.slug}</span>
                    </span>
                  )}
                </div>

                {/* Prize Highlights */}
                <div className="md:col-span-7 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[12px] uppercase font-bold text-text-muted tracking-wider">
                      Main Prize Specification
                    </span>
                    <h3 className="font-heading font-bold text-[20px] text-text-primary">
                      {raffle.prizeName || raffle.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-bg border border-border rounded-button flex flex-col">
                      <span className="text-[11px] text-text-muted font-semibold">Prize Retail Value (RRP)</span>
                      <span className="font-heading font-bold text-[18px] text-text-primary">
                        {raffle.mainPrizeValue ? formatCurrency(Number(raffle.mainPrizeValue)) : "Unspecified"}
                      </span>
                    </div>

                    <div className="p-3 bg-bg border border-border rounded-button flex flex-col">
                      <span className="text-[11px] text-text-muted font-semibold">Ticket Price</span>
                      <span className="font-heading font-bold text-[18px] text-text-brand">
                        {formatCurrency(ticketPrice)}
                      </span>
                    </div>

                    <div className="p-3 bg-bg border border-border rounded-button flex flex-col">
                      <span className="text-[11px] text-text-muted font-semibold">Total Tickets Available</span>
                      <span className="font-heading font-bold text-[18px] text-text-primary">
                        {totalTickets.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 bg-bg border border-border rounded-button flex flex-col">
                      <span className="text-[11px] text-text-muted font-semibold">Instant Win Count</span>
                      <span className="font-heading font-bold text-[18px] text-text-primary">
                        {instantWins.length} {instantWins.length === 1 ? "Prize" : "Prizes"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-divider text-[12px] text-text-muted">
                    <span>Host Creator:</span>
                    <span className="font-semibold text-text-primary">
                      {host?.businessName || `${user?.firstName || "Host"} ${user?.lastName || ""}`}
                    </span>
                  </div>
                </div>

              </div>

              {/* Full Description */}
              <div className="flex flex-col gap-2 bg-surface p-5 rounded-card border border-border">
                <span className="text-[12px] uppercase font-bold text-text-muted tracking-wider">
                  Competition Description & Rules
                </span>
                <div className="p-4 bg-bg border border-border rounded-button">
                  <p className="font-sans text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap font-medium">
                    {raffle.description || "No description provided by the host."}
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRICING & ECONOMICS */}
          {activeTab === "pricing" && (
            <div className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface p-4 rounded-card border border-border flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-text-muted uppercase">Gross Potential Revenue</span>
                  <span className="font-heading font-bold text-[22px] text-text-primary">
                    {formatCurrency(grossRevenue)}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {totalTickets.toLocaleString()} tickets × {formatCurrency(ticketPrice)}
                  </span>
                </div>

                <div className="bg-surface p-4 rounded-card border border-border flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-text-muted uppercase">
                    Platform Fee ({commissionRate}%)
                  </span>
                  <span className="font-heading font-bold text-[22px] text-text-brand">
                    {formatCurrency(platformFee)}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Based on {planName} plan commission
                  </span>
                </div>

                <div className="bg-surface p-4 rounded-card border border-border flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-text-muted uppercase">Estimated Host Net Payout</span>
                  <span className="font-heading font-bold text-[22px] text-emerald-600">
                    {formatCurrency(netPayout)}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Gross revenue minus platform commission
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown Table */}
              <div className="bg-surface rounded-card border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-accent-bg/20">
                  <h4 className="font-heading font-bold text-[14px] text-text-primary">
                    Financial & Order Constraint Audit
                  </h4>
                </div>

                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-5 py-3 text-[13px]">
                    <span className="text-text-muted font-medium">Ticket Price (Gross)</span>
                    <span className="font-semibold text-text-primary">{formatCurrency(ticketPrice)}</span>
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 text-[13px]">
                    <span className="text-text-muted font-medium">Total Tickets Issued</span>
                    <span className="font-semibold text-text-primary">{totalTickets.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 text-[13px]">
                    <span className="text-text-muted font-medium">Minimum Tickets Per Order</span>
                    <span className="font-semibold text-text-primary">{raffle.minTicketsPerUser || 1} ticket</span>
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 text-[13px]">
                    <span className="text-text-muted font-medium">Maximum Tickets Per User</span>
                    <span className="font-semibold text-text-primary">
                      {raffle.maxTicketsPerUser ? `${raffle.maxTicketsPerUser} tickets` : "Unlimited"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 text-[13px]">
                    <span className="text-text-muted font-medium">Host Subscription Plan Tier</span>
                    <span className="px-2 py-0.5 rounded-badge bg-elevated text-text-brand border border-border-medium text-[11px] font-bold">
                      {planName} ({commissionRate}% platform fee)
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 text-[13px] bg-bg/40">
                    <span className="text-text-primary font-bold">Max Potential Host Payout</span>
                    <span className="font-bold text-emerald-600 text-[15px]">{formatCurrency(netPayout)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SCHEDULE & DRAW */}
          {activeTab === "schedule" && (
            <div className="flex flex-col gap-6">
              
              {/* Timing Banner */}
              <div className="bg-surface p-5 rounded-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-text-muted uppercase">UK Time Schedule Status</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-badge text-[12px] font-bold uppercase tracking-wider",
                        timing.status === "LIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : timing.status === "UPCOMING"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      )}
                    >
                      {timing.status === "LIVE" ? "Schedule Active (Ready for Live)" : timing.status === "UPCOMING" ? "Upcoming Start Date" : "Draw Date Past"}
                    </span>
                    <span className="text-[12px] text-text-muted font-medium">
                      All dates evaluated in London (BST/GMT)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-text-muted font-medium">Submission Timestamp:</span>
                  <span className="text-[12px] font-mono font-semibold text-text-primary">
                    {raffle.createdAt ? formatUKDateTime(raffle.createdAt) : "—"}
                  </span>
                </div>
              </div>

              {/* Date Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface p-4 rounded-card border border-border flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-text-brand">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.253 18.75m3-18.75H3.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15" />
                    </svg>
                    <span className="text-[12px] font-bold uppercase tracking-wider">Start Date & Time (UK)</span>
                  </div>
                  <span className="font-heading font-bold text-[18px] text-text-primary">
                    {raffle.startDate ? formatUKDateTime(raffle.startDate) : "Immediate upon approval"}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Competition will become visible and open for ticket purchases at this UK time.
                  </span>
                </div>

                <div className="bg-surface p-4 rounded-card border border-border flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-text-brand">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                    <span className="text-[12px] font-bold uppercase tracking-wider">Draw / End Date (UK)</span>
                  </div>
                  <span className="font-heading font-bold text-[18px] text-text-primary">
                    {raffle.endDate ? formatUKDateTime(raffle.endDate) : "TBD"}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Ticket sales close and main draw winner will be selected.
                  </span>
                </div>
              </div>

              {/* Auto Draw Configuration */}
              <div className="bg-surface rounded-card border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-accent-bg/20">
                  <h4 className="font-heading font-bold text-[14px] text-text-primary">
                    Draw Execution Settings
                  </h4>
                </div>

                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-5 py-3 text-[13px]">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-primary">Automated Draw System</span>
                      <span className="text-[11px] text-text-muted">Will system automatically select a random winning ticket</span>
                    </div>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-badge text-[11px] font-bold uppercase",
                        raffle.isAutoDraw ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                      )}
                    >
                      {raffle.isAutoDraw ? "Enabled" : "Manual Draw"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 text-[13px]">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-primary">Draw Immediately Upon End Date</span>
                      <span className="text-[11px] text-text-muted">Draw fires automatically as soon as UK end date timestamp passes</span>
                    </div>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-badge text-[11px] font-bold uppercase",
                        raffle.autoDrawDate ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                      )}
                    >
                      {raffle.autoDrawDate ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 text-[13px]">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-primary">Early Draw on 100% Sell Out</span>
                      <span className="text-[11px] text-text-muted">Automatically triggers draw early if all tickets sell out before end date</span>
                    </div>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-badge text-[11px] font-bold uppercase",
                        raffle.autoDrawSoldOut ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                      )}
                    >
                      {raffle.autoDrawSoldOut ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: INSTANT WINS */}
          {activeTab === "instantWins" && (
            <div className="flex flex-col gap-6">
              
              {/* Header stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface p-4 rounded-card border border-border flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-text-muted uppercase">Total Instant Win Prizes</span>
                  <span className="font-heading font-bold text-[22px] text-text-primary">
                    {instantWins.length}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {instantWins.length > 0 ? "Configured for this competition" : "No instant wins enabled"}
                  </span>
                </div>

                <div className="bg-surface p-4 rounded-card border border-border flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-text-muted uppercase">Combined Instant Win Value</span>
                  <span className="font-heading font-bold text-[22px] text-text-brand">
                    {formatCurrency(totalInstantWinsRRP)}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Cumulative RRP across all winning tickets
                  </span>
                </div>
              </div>

              {/* Table or Empty State */}
              {instantWins.length === 0 ? (
                <div className="bg-surface p-8 rounded-card border border-border text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center text-text-brand">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .982-3.172M12 3a4.5 4.5 0 0 0-4.5 4.5c0 1.298.552 2.47 1.439 3.29m6.122 0A4.478 4.478 0 0 0 16.5 7.5 4.5 4.5 0 0 0 12 3z" />
                    </svg>
                  </div>
                  <h4 className="font-heading font-bold text-[16px] text-text-primary">
                    No Instant Win Prizes
                  </h4>
                  <p className="font-sans text-[13px] text-text-muted max-w-[420px]">
                    This competition does not contain instant win prizes. Only the main draw winner will be selected.
                  </p>
                </div>
              ) : (
                <div className="bg-surface rounded-card border border-border overflow-hidden">
                  <div className="px-5 py-3 border-b border-border bg-accent-bg/20 flex items-center justify-between">
                    <h4 className="font-heading font-bold text-[14px] text-text-primary">
                      Instant Win Prizes Registry ({instantWins.length})
                    </h4>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans text-[13px]">
                      <thead>
                        <tr className="border-b border-border bg-bg/60 text-text-muted font-semibold text-[11px] uppercase tracking-wider">
                          <th className="py-3 px-4">Ticket #</th>
                          <th className="py-3 px-4">Prize</th>
                          <th className="py-3 px-4">Retail Value</th>
                          <th className="py-3 px-4">Image</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {instantWins.map((iw: any) => (
                          <tr key={iw.id} className="hover:bg-accent-bg/20 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-text-brand">
                              #{iw.ticketNumber}
                            </td>
                            <td className="py-3 px-4 font-semibold text-text-primary">
                              {iw.prizeName}
                            </td>
                            <td className="py-3 px-4 font-semibold text-text-secondary">
                              {iw.rrpValue ? formatCurrency(Number(iw.rrpValue)) : "—"}
                            </td>
                            <td className="py-3 px-4">
                              {iw.image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={iw.image}
                                  alt={iw.prizeName}
                                  className="w-10 h-10 object-cover rounded-button border border-border"
                                />
                              ) : (
                                <span className="text-[11px] text-text-muted">None</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-badge text-[10px] font-bold uppercase",
                                  iw.isClaimed
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                )}
                              >
                                {iw.isClaimed ? "Claimed" : "Unclaimed"}
                              </span>
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

          {/* TAB 5: HOST PROFILE (CREATOR) */}
          {activeTab === "host" && (
            <div className="flex flex-col gap-6">
              
              {/* Host Summary Card */}
              <div className="bg-surface p-5 rounded-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent-bg border-2 border-primary flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    {user?.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.avatarUrl}
                        alt={host?.businessName || "Host"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-heading font-bold text-[20px] text-text-brand">
                        {getHostInitials()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-[18px] text-text-primary">
                        {host?.businessName || `${user?.firstName || "Host"} ${user?.lastName || ""}`}
                      </h3>
                      {host?.isVerified ? (
                        <span className="px-2 py-0.5 rounded-badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase flex items-center gap-1">
                          <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                          Verified Host
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase">
                          Unverified
                        </span>
                      )}
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-badge text-[10px] font-bold uppercase",
                          user?.isBlocked
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        )}
                      >
                        {user?.isBlocked ? "Blocked" : "Active Account"}
                      </span>
                    </div>

                    <span className="text-[12px] text-text-muted font-medium">
                      Host Slug: <span className="font-mono text-text-primary">/{host?.slug || "none"}</span>
                      {" · "}Contact: {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-1 text-[12px] text-text-muted">
                  <span>Host Member Since:</span>
                  <span className="font-semibold text-text-primary">
                    {host?.createdAt ? formatUKDate(host.createdAt) : "—"}
                  </span>
                </div>
              </div>

              {/* Host Database Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Contact & Personal Information */}
                <div className="bg-surface rounded-card border border-border p-5 flex flex-col gap-3">
                  <h4 className="font-heading font-bold text-[14px] text-text-primary border-b border-border pb-2">
                    Contact & Identification
                  </h4>

                  <div className="flex flex-col gap-2.5 text-[13px]">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-medium">Full Name</span>
                      <span className="font-semibold text-text-primary">
                        {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Not specified"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-medium">Email Address</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-text-primary">{user?.email || "N/A"}</span>
                        {user?.isEmailVerified ? (
                          <span className="px-1.5 py-0.2 rounded-badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase">
                            Verified
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-badge bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold uppercase">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-medium">Host Phone</span>
                      <span className="font-semibold text-text-primary">{host?.phone || user?.phone || "Not provided"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-medium">Location / City</span>
                      <span className="font-semibold text-text-primary">{user?.location || "Not provided"}</span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="text-text-muted font-medium shrink-0">Full Address</span>
                      <span className="font-semibold text-text-primary text-right max-w-[260px]">
                        {host?.address || user?.address || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account & Performance Metrics */}
                <div className="bg-surface rounded-card border border-border p-5 flex flex-col gap-3">
                  <h4 className="font-heading font-bold text-[14px] text-text-primary border-b border-border pb-2">
                    Account & Performance Metrics
                  </h4>

                  <div className="flex flex-col gap-2.5 text-[13px]">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-medium">Available Wallet Balance</span>
                      <span className="font-bold text-[15px] text-text-brand">
                        {formatCurrency(Number(host?.walletBalance || 0))}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-medium">Total Competitions Created</span>
                      <span className="font-semibold text-text-primary">
                        {host?._count?.raffles ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-medium">Host ID</span>
                      <span className="font-mono text-[11px] text-text-primary">{host?.id || raffle.hostId}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-medium">User Account ID</span>
                      <span className="font-mono text-[11px] text-text-primary">{user?.id || host?.userId || "N/A"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-text-muted font-medium">User Role</span>
                      <span className="font-semibold text-text-primary">{user?.role || "HOST"}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Host Subscription Plan Card */}
              <div className="bg-surface rounded-card border border-border p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="font-heading font-bold text-[14px] text-text-primary">
                    Active Subscription Tier
                  </h4>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-badge text-[11px] font-bold uppercase",
                      isPaidPlan
                        ? "bg-primary text-white"
                        : "bg-elevated text-text-brand border border-border-medium"
                    )}
                  >
                    {planName} Plan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
                  <div className="p-3 bg-bg border border-border rounded-button flex flex-col">
                    <span className="text-[11px] text-text-muted font-semibold">Subscription Cost</span>
                    <span className="font-bold text-text-primary">
                      {activeSub?.plan?.price ? formatCurrency(Number(activeSub.plan.price)) : "Free (£0.00)"}
                    </span>
                  </div>

                  <div className="p-3 bg-bg border border-border rounded-button flex flex-col">
                    <span className="text-[11px] text-text-muted font-semibold">Max Active Raffles</span>
                    <span className="font-bold text-text-primary">
                      {activeSub?.plan?.maxActiveRaffles ? `${activeSub.plan.maxActiveRaffles} raffles` : "Unlimited"}
                    </span>
                  </div>

                  <div className="p-3 bg-bg border border-border rounded-button flex flex-col">
                    <span className="text-[11px] text-text-muted font-semibold">Platform Fee Applied</span>
                    <span className="font-bold text-text-brand">
                      {commissionRate}%
                    </span>
                  </div>
                </div>

                {activeSub && (
                  <div className="text-[12px] text-text-muted flex items-center justify-between pt-1">
                    <span>
                      Valid: {formatUKDate(activeSub.startDate)} to {formatUKDate(activeSub.endDate)}
                    </span>
                    <span className="font-semibold text-emerald-600">Status: {activeSub.status}</span>
                  </div>
                )}
              </div>

              {/* Host Bio */}
              <div className="bg-surface rounded-card border border-border p-5 flex flex-col gap-2">
                <h4 className="font-heading font-bold text-[14px] text-text-primary">
                  Host Bio / About
                </h4>
                <div className="p-3 bg-bg border border-border rounded-button text-[13px] text-text-secondary leading-relaxed font-medium">
                  {host?.bio || "No public bio provided by the host."}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer (Action Buttons) */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border bg-surface shrink-0 gap-3">
          <div className="flex items-center gap-2 text-[12px] text-text-muted">
            <span>Reviewing:</span>
            <span className="font-semibold text-text-primary truncate max-w-[220px]">
              {raffle.title}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={isApproving}
              className="flex-1 sm:flex-none h-[40px] px-4 rounded-button bg-bg border border-border hover:bg-elevated text-text-secondary cursor-pointer font-sans font-semibold text-[13px] transition-colors disabled:opacity-50"
            >
              Close
            </button>

            <button
              onClick={() => onReject(raffle.id, raffle.title)}
              disabled={isApproving}
              className="flex-1 sm:flex-none h-[40px] px-5 rounded-button bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 cursor-pointer font-sans font-semibold text-[13px] transition-colors disabled:opacity-50 shadow-sm"
            >
              Reject
            </button>

            <button
              onClick={() => onApprove(raffle.id)}
              disabled={isApproving}
              className="flex-1 sm:flex-none h-[40px] px-6 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[13px] transition-all cursor-pointer disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
            >
              {isApproving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Approve & Publish</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Image Zoom Modal */}
      {isImageZoomed && raffle.mainImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={raffle.mainImage}
              alt={raffle.title}
              className="max-w-full max-h-[85vh] object-contain rounded-card border border-white/20 shadow-2xl"
            />
            <button
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-button bg-black/70 hover:bg-black text-white text-[12px] font-semibold transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </>
  );
}
