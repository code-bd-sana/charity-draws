"use client";

import React from "react";
import { DollarSign } from "lucide-react";
import { PayoutHistoryItem } from "../../../../types/host-dashboard.types";
import { cn } from "../../../../lib/utils";
import EmptyState from "../../../ui/EmptyState";

interface Props {
  history: PayoutHistoryItem[];
}

export default function PayoutHistoryTable({ history }: Props) {
  if (!history || history.length === 0) {
    return (
      <div className="w-full bg-surface border border-border rounded-card p-6 mt-2 shadow-card select-none">
        <EmptyState
          icon={DollarSign}
          title="No Payout Transactions Yet"
          description="You haven't requested any payouts yet. When your competitions end and funds clear, your withdrawal history will appear here."
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-border rounded-card overflow-hidden flex flex-col mt-2 shadow-card select-none">
      {/* Header */}
      <div className="p-6 border-b border-divider flex flex-col gap-1 bg-surface">
        <h3 className="font-heading font-bold text-base md:text-lg text-text-primary">
          Recent Transactions
        </h3>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
          A record of all your successful and processing payouts.
        </p>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto scrollbar-thin min-h-[300px]">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="border-b border-divider bg-accent-bg/30">
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Date
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Gross Amount
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Fee Deducted
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Net Amount
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Method
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Reference ID
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr 
                key={item.id}
                className="group transition-colors hover:bg-accent-bg/40 border-b border-divider last:border-b-0"
              >
                <td className="py-4 px-6">
                  <span className="font-sans font-medium text-xs md:text-sm text-text-secondary">
                    {item.date}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-heading font-bold text-xs md:text-sm text-text-primary">
                    £{item.grossAmount.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-heading font-bold text-xs md:text-sm text-red-600">
                    £{item.feeDeducted.toFixed(2)} ({item.feePercent}%)
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-heading font-bold text-xs md:text-sm text-text-brand">
                    £{item.netAmount.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-sans font-medium text-xs md:text-sm text-text-secondary">
                    {item.method}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full border font-bold text-[11px] shadow-sm",
                      item.status === "Paid" 
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700" 
                        : "border-purple-200 bg-purple-50 text-text-brand"
                    )}>
                      {item.status}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-mono text-xs text-text-muted">
                    {item.referenceId}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
