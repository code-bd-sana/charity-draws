import React from "react";
import { PayoutMetrics } from "../../../../types/host-dashboard.types";

interface Props {
  metrics: PayoutMetrics;
}

export default function PayoutMetricsCards({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
      
      {/* Available Balance */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium transition-all">
        <h4 className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
          Available Balance
        </h4>
        <div className="font-heading font-bold text-2xl md:text-3xl text-text-primary">
          £{metrics.availableBalance.toFixed(2)}
        </div>
        <p className="font-sans font-medium text-xs text-text-secondary">
          Ready to withdraw
        </p>
      </div>

      {/* Pending Clearance */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium transition-all">
        <h4 className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
          Pending Clearance
        </h4>
        <div className="font-heading font-bold text-2xl md:text-3xl text-text-primary">
          £{metrics.pendingClearance.toFixed(2)}
        </div>
        <p className="font-sans font-medium text-xs text-text-secondary">
          Processing 3–5 days
        </p>
      </div>

      {/* Total Lifetime Earnings */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium transition-all">
        <h4 className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
          Total Lifetime Earnings
        </h4>
        <div className="font-heading font-bold text-2xl md:text-3xl text-text-primary">
          £{metrics.totalLifetimeEarnings.toFixed(2)}
        </div>
        <p className="font-sans font-medium text-xs text-text-secondary">
          Across all completed raffles
        </p>
      </div>

      {/* Total Fees Paid */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium transition-all">
        <h4 className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
          Total Fees Paid
        </h4>
        <div className="font-heading font-bold text-2xl md:text-3xl text-text-brand">
          £{metrics.totalFeesPaid.toFixed(2)}
        </div>
        <p className="font-sans font-medium text-xs text-text-secondary">
          Across all completed raffles
        </p>
      </div>

    </div>
  );
}
