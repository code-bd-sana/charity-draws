"use client";

import React, { useState, useMemo } from "react";
import { useAllSubscriptionsAdmin, useCancelSubscriptionAdminMutation } from "@/hooks/useSubscriptionHooks";
import { AdminSubscriptionItem } from "@/services/subscription.service";
import { toast } from "sonner";

export default function SubscriptionTable() {
  const { data: subscriptions, isLoading } = useAllSubscriptionsAdmin();
  const cancelMutation = useCancelSubscriptionAdminMutation();

  const [activeFilter, setActiveFilter] = useState<"All" | "ACTIVE" | "EXPIRED" | "CANCELLED">("All");
  const [selectedPlan, setSelectedPlan] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedSubForCancel, setSelectedSubForCancel] = useState<AdminSubscriptionItem | null>(null);
  const [selectedSubForDetails, setSelectedSubForDetails] = useState<AdminSubscriptionItem | null>(null);

  const limit = 10;
  const subs: AdminSubscriptionItem[] = useMemo(() => subscriptions || [], [subscriptions]);

  // Status counts
  const counts = useMemo(() => {
    const res = { All: subs.length, ACTIVE: 0, EXPIRED: 0, CANCELLED: 0 };
    subs.forEach((s) => {
      if (s.status === "ACTIVE") res.ACTIVE++;
      else if (s.status === "EXPIRED") res.EXPIRED++;
      else if (s.status === "CANCELLED") res.CANCELLED++;
    });
    return res;
  }, [subs]);

  // Unique plans for dropdown
  const planOptions = useMemo(() => {
    const names = new Set<string>();
    subs.forEach((s) => {
      if (s.plan?.name) names.add(s.plan.name);
    });
    return Array.from(names);
  }, [subs]);

  // Filtering
  const filteredSubs = useMemo(() => {
    return subs.filter((sub) => {
      // Status filter
      if (activeFilter !== "All" && sub.status !== activeFilter) {
        return false;
      }
      // Plan filter
      if (selectedPlan !== "All" && sub.plan?.name?.toLowerCase() !== selectedPlan.toLowerCase()) {
        return false;
      }
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const businessName = (sub.host?.businessName || "").toLowerCase();
        const userName = `${sub.host?.user?.firstName || ""} ${sub.host?.user?.lastName || ""}`.toLowerCase();
        const email = (sub.host?.user?.email || "").toLowerCase();
        const planName = (sub.plan?.name || "").toLowerCase();
        const txId = (sub.transaction?.gatewayTransactionId || sub.transaction?.id || "").toLowerCase();
        const gateway = (sub.transaction?.paymentGateway || "").toLowerCase();

        return (
          businessName.includes(q) ||
          userName.includes(q) ||
          email.includes(q) ||
          planName.includes(q) ||
          txId.includes(q) ||
          gateway.includes(q)
        );
      }
      return true;
    });
  }, [subs, activeFilter, selectedPlan, search]);

  // Pagination
  const totalPages = Math.ceil(filteredSubs.length / limit) || 1;
  const paginatedSubs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredSubs.slice(start, start + limit);
  }, [filteredSubs, page, limit]);

  const handleExportCSV = () => {
    if (filteredSubs.length === 0) {
      toast.info("No subscriptions to export");
      return;
    }
    const headers = [
      "Subscription ID",
      "Host Business",
      "Owner Name",
      "Host Email",
      "Plan",
      "Plan Price (£)",
      "Start Date",
      "Renewal Date",
      "Status",
      "Payment Amount (£)",
      "Payment Status",
      "Payment Gateway",
      "Gateway Tx ID",
    ];

    const rows = filteredSubs.map((sub) => {
      const ownerName = sub.host?.user?.firstName
        ? `${sub.host.user.firstName} ${sub.host.user.lastName || ""}`.trim()
        : "N/A";
      return [
        sub.id,
        sub.host?.businessName || "Unknown Host",
        ownerName,
        sub.host?.user?.email || "N/A",
        sub.plan?.name || "Free",
        sub.plan?.price || "0.00",
        new Date(sub.startDate || sub.createdAt).toISOString().slice(0, 10),
        new Date(sub.endDate).toISOString().slice(0, 10),
        sub.status,
        sub.transaction?.amount || (Number(sub.plan?.price) === 0 ? "0.00" : "N/A"),
        sub.transaction?.status || (Number(sub.plan?.price) === 0 ? "COMPLETED" : "NO_RECORD"),
        sub.transaction?.paymentGateway || (Number(sub.plan?.price) === 0 ? "FREE_TIER" : "N/A"),
        sub.transaction?.gatewayTransactionId || "N/A",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `subscriptions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Subscriptions exported successfully");
  };

  const handleConfirmCancel = async () => {
    if (!selectedSubForCancel) return;
    try {
      await cancelMutation.mutateAsync(selectedSubForCancel.id);
      toast.success("Subscription has been cancelled successfully");
      setSelectedSubForCancel(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel subscription");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-[10px] shadow-sm">
            Active
          </span>
        );
      case "EXPIRED":
        return (
          <span className="px-3 py-1 rounded-badge border border-amber-200 bg-amber-50 text-amber-700 font-sans font-semibold text-[10px] shadow-sm">
            Expired
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-3 py-1 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[10px] shadow-sm">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-badge border border-border bg-surface text-text-muted font-sans font-semibold text-[10px] shadow-sm">
            {status}
          </span>
        );
    }
  };

  const getPlanBadge = (planName: string) => {
    const isPro = planName?.toLowerCase() === "pro";
    const isPremium = planName?.toLowerCase() === "premium";

    if (isPro) {
      return (
        <span className="px-3 py-1 rounded-badge border border-purple-200 bg-purple-50 text-purple-700 font-sans font-bold text-[10px] shadow-sm">
          Pro
        </span>
      );
    }
    if (isPremium) {
      return (
        <span className="px-3 py-1 rounded-badge border border-blue-200 bg-blue-50 text-blue-700 font-sans font-bold text-[10px] shadow-sm">
          Premium
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-badge border border-border-medium bg-accent-bg text-text-brand font-sans font-semibold text-[10px] shadow-sm">
        {planName || "Free"}
      </span>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 select-none w-full">
        {/* Controls Bar: Filters, Search, CSV Export */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border shadow-card">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {(["All", "ACTIVE", "EXPIRED", "CANCELLED"] as const).map((filter) => {
              const label = filter === "ACTIVE" ? "Active" : filter === "EXPIRED" ? "Expired" : filter === "CANCELLED" ? "Cancelled" : "All";
              const count = counts[filter];
              const isSelected = activeFilter === filter;

              return (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-button text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-text-brand text-white shadow-sm"
                      : "bg-surface hover:bg-accent-bg text-text-muted hover:text-text-primary"
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-accent-bg text-text-muted border border-border"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Actions: Plan Filter, Search, CSV */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Plan Dropdown */}
            <select
              value={selectedPlan}
              onChange={(e) => {
                setSelectedPlan(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 text-xs bg-bg border border-border rounded-button text-text-primary focus:outline-none focus:border-text-brand cursor-pointer shadow-sm"
            >
              <option value="All">All Plans</option>
              {planOptions.map((p) => (
                <option key={p} value={p}>
                  {p} Plan
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search host, email, tx..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 pl-8 pr-3 text-xs bg-bg border border-border rounded-button text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-brand shadow-sm"
              />
              <svg
                className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="h-9 px-3 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              title="Export as CSV"
            >
              <svg className="w-3.5 h-3.5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full bg-surface border border-border rounded-card overflow-hidden shadow-card overflow-x-auto flex flex-col">
          {isLoading ? (
            <div className="p-8 text-center text-text-muted font-sans text-sm animate-pulse">
              Loading real subscription data...
            </div>
          ) : paginatedSubs.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center text-text-muted">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="font-heading font-bold text-base text-text-primary">No subscriptions found</span>
              <p className="text-xs text-text-muted max-w-sm">
                {search || selectedPlan !== "All" || activeFilter !== "All"
                  ? "Try clearing your search query or reset your filters."
                  : "No subscriptions have been recorded yet."}
              </p>
              {(search || selectedPlan !== "All" || activeFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedPlan("All");
                    setActiveFilter("All");
                    setPage(1);
                  }}
                  className="mt-2 text-xs font-semibold text-text-brand hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full min-w-[1050px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-accent-bg/50">
                  <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[24%]">
                    HOST / BUSINESS
                  </th>
                  <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%]">
                    PLAN
                  </th>
                  <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%]">
                    START DATE
                  </th>
                  <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%]">
                    EXPIRY / RENEWAL
                  </th>
                  <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[22%]">
                    PAYMENT & GATEWAY
                  </th>
                  <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-center">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubs.map((sub, i) => {
                  const hostName =
                    sub.host?.businessName ||
                    (sub.host?.user?.firstName
                      ? `${sub.host.user.firstName} ${sub.host.user.lastName || ""}`.trim()
                      : "Unknown Host");
                  const userEmail = sub.host?.user?.email;
                  const initials = hostName.substring(0, 2).toUpperCase();
                  const avatarUrl = sub.host?.user?.avatarUrl;

                  const startDate = new Date(sub.startDate || sub.createdAt);
                  const endDate = new Date(sub.endDate);
                  const formattedStartDate = new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(startDate);
                  const formattedEndDate = new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(endDate);

                  const tx = sub.transaction;
                  const isFreeTier = Number(sub.plan?.price || 0) === 0;

                  return (
                    <tr
                      key={sub.id}
                      className={`${
                        i !== paginatedSubs.length - 1 ? "border-b border-divider" : ""
                      } hover:bg-accent-bg/30 transition-colors`}
                    >
                      {/* Host */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={hostName}
                              className="w-9 h-9 rounded-full object-cover border border-border-medium shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0">
                              <span className="font-sans font-bold text-[11px] text-text-brand">
                                {initials}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-sans font-semibold text-[13px] text-text-primary truncate">
                              {hostName}
                            </span>
                            {userEmail && (
                              <span className="font-sans text-[11px] text-text-muted truncate">
                                {userEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 items-start">
                          {getPlanBadge(sub.plan?.name || "Free")}
                          <span className="font-sans text-[11px] text-text-muted">
                            £{sub.plan?.price || "0.00"}/mo
                          </span>
                        </div>
                      </td>

                      {/* Start Date */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-sans font-medium text-[13px] text-text-primary">
                            {formattedStartDate}
                          </span>
                          <span className="font-sans text-[10px] text-text-muted">
                            Activated
                          </span>
                        </div>
                      </td>

                      {/* Expiry / Renewal Date */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-sans font-medium text-[13px] text-text-primary">
                            {formattedEndDate}
                          </span>
                          <span className="font-sans text-[10px] text-text-muted">
                            {sub.status === "ACTIVE" ? "Valid Until" : "Ended"}
                          </span>
                        </div>
                      </td>

                      {/* Payment & Gateway */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          {tx ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <span className="font-sans font-bold text-[13px] text-text-brand">
                                  £{tx.amount}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                  {tx.status}
                                </span>
                              </div>
                              <span className="font-sans text-[11px] text-text-muted truncate">
                                Gateway: <strong className="font-medium text-text-primary">{tx.paymentGateway}</strong>
                              </span>
                              {tx.gatewayTransactionId && (
                                <span className="font-mono text-[10px] text-text-muted truncate max-w-[220px]" title={tx.gatewayTransactionId}>
                                  Ref: {tx.gatewayTransactionId}
                                </span>
                              )}
                            </>
                          ) : isFreeTier ? (
                            <div className="flex flex-col">
                              <span className="font-sans font-bold text-[13px] text-text-brand">£0.00</span>
                              <span className="font-sans text-[11px] text-text-muted">Free Plan Activation</span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-sans font-bold text-[13px] text-text-brand">£{sub.plan?.price}</span>
                              <span className="font-sans text-[11px] text-amber-600 font-medium">No Gateway Record</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status & Cancel Action */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          {getStatusBadge(sub.status)}
                          {sub.status === "ACTIVE" && (
                            <button
                              onClick={() => setSelectedSubForCancel(sub)}
                              className="text-[10px] font-medium text-red-600 hover:text-red-700 hover:underline cursor-pointer transition-colors"
                            >
                              Cancel Plan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination Footer */}
          {filteredSubs.length > 0 && (
            <div className="border-t border-border p-4 bg-accent-bg/30 flex items-center justify-between gap-4">
              <span className="font-sans text-xs text-text-muted">
                Showing <strong className="font-semibold text-text-primary">{(page - 1) * limit + 1}</strong> to{" "}
                <strong className="font-semibold text-text-primary">
                  {Math.min(page * limit, filteredSubs.length)}
                </strong>{" "}
                of <strong className="font-semibold text-text-primary">{filteredSubs.length}</strong> subscriptions
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-button border border-border bg-surface text-text-primary hover:bg-accent-bg transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-sm"
                >
                  Previous
                </button>
                <span className="px-2 text-xs font-semibold text-text-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-button border border-border bg-surface text-text-primary hover:bg-accent-bg transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {selectedSubForCancel && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => !cancelMutation.isPending && setSelectedSubForCancel(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[420px] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-6 select-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-text-primary">Cancel Subscription</h3>
              <button
                onClick={() => setSelectedSubForCancel(null)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                disabled={cancelMutation.isPending}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              Are you sure you want to cancel the active{" "}
              <strong className="text-text-primary font-semibold">
                {selectedSubForCancel.plan?.name}
              </strong>{" "}
              subscription for host{" "}
              <strong className="text-text-primary font-semibold">
                {selectedSubForCancel.host?.businessName || "this host"}
              </strong>
              ? This action will mark the subscription as cancelled immediately.
            </p>

            <div className="bg-bg border border-border rounded-card p-3 mb-5 text-xs flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-text-muted">Host:</span>
                <span className="font-semibold text-text-primary">
                  {selectedSubForCancel.host?.businessName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Plan:</span>
                <span className="font-semibold text-text-brand">
                  {selectedSubForCancel.plan?.name} (£{selectedSubForCancel.plan?.price}/mo)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">End Date:</span>
                <span className="font-mono text-text-muted">
                  {new Date(selectedSubForCancel.endDate).toISOString().slice(0, 10)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedSubForCancel(null)}
                disabled={cancelMutation.isPending}
                className="flex-1 h-10 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelMutation.isPending}
                className="flex-1 h-10 rounded-button bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel Plan"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
