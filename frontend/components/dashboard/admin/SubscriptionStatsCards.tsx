"use client";

import React from "react";
import { useAdminSubscriptionStats } from "../../../hooks/useSubscriptionHooks";

export default function SubscriptionStatsCards() {
  const { data: stats, isLoading } = useAdminSubscriptionStats();

  const getPlanData = (planName: string) => {
    return stats?.planDistribution?.find(p => p.name.toLowerCase() === planName.toLowerCase()) || { value: 0, percentage: "0%" };
  };

  const premiumPlan = getPlanData("Premium");
  const proPlan = getPlanData("Pro");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
      
      {/* Premium Subscribers */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Premium Subscribers
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : premiumPlan.value}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">{premiumPlan.percentage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Subscribers */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Pro Subscribers
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : proPlan.value}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">{proPlan.percentage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MRR */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          MRR
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-brand leading-none">
            {isLoading ? "..." : `£${stats?.mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">Active</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
