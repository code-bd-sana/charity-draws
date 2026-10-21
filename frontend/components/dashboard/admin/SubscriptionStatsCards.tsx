"use client";

import React from "react";
import { useAdminSubscriptionStats } from "../../../hooks/useSubscriptionHooks";

export default function SubscriptionStatsCards() {
  const { data: stats, isLoading } = useAdminSubscriptionStats();

  const totalActive = stats?.totalActive ?? 0;
  const paidActive = stats?.paidActive ?? 0;
  const freeActive = stats?.freeActive ?? 0;
  const mrr = stats?.mrr ?? 0;
  const totalRecords = stats?.totalSubscriptions ?? 0;

  const paidPercentage = totalActive > 0 ? Math.round((paidActive / totalActive) * 100) : 0;
  const freePercentage = totalActive > 0 ? Math.round((freeActive / totalActive) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none h-full">
      
      {/* Total Active Subscriptions */}
      <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Active Subscriptions
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl text-text-primary leading-none">
            {isLoading ? "..." : totalActive}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">
                {totalRecords} Total Recorded
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MRR */}
      <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Monthly Recurring Revenue
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl text-text-brand leading-none">
            {isLoading ? "..." : `£${mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">Active Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Paid Subscribers */}
      <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Paid Subscribers
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl text-accent-solid leading-none">
            {isLoading ? "..." : paidActive}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-accent-bg border border-border-medium flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-text-brand">
                {paidPercentage}% of active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Free Tier Hosts */}
      <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Free Tier Hosts
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl text-text-primary leading-none">
            {isLoading ? "..." : freeActive}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">
                {freePercentage}% of active
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
