"use client";

import React from "react";
import { BillingHistoryItem } from "../../../../types/host-dashboard.types";

interface Props {
  history: BillingHistoryItem[];
}

export default function BillingHistoryTable({ history }: Props) {
  return (
    <div className="w-full bg-surface border border-border rounded-card overflow-hidden flex flex-col shadow-card">
      
      {/* Header */}
      <div className="p-6 border-b border-divider bg-surface">
        <h3 className="font-heading font-bold text-base md:text-lg text-text-primary">
          Billing History
        </h3>
      </div>

      {/* Table Content */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-divider bg-accent-bg/30">
              <th className="py-3 px-6 text-left font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Date
              </th>
              <th className="py-3 px-6 text-left font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Description
              </th>
              <th className="py-3 px-6 text-left font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Amount
              </th>
              <th className="py-3 px-6 text-left font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Invoice
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr 
                key={item.id} 
                className="hover:bg-accent-bg/40 transition-colors border-b border-divider last:border-b-0"
              >
                <td className="py-4 px-6 font-sans font-bold text-xs md:text-sm text-text-primary">
                  {item.date}
                </td>
                <td className="py-4 px-6 font-sans font-medium text-xs md:text-sm text-text-secondary">
                  {item.description}
                </td>
                <td className="py-4 px-6 font-sans font-bold text-xs md:text-sm text-text-brand">
                  £{item.amount.toFixed(2)}
                </td>
                <td className="py-4 px-6 font-mono font-medium text-xs text-text-muted">
                  {item.invoice || item.id}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center font-sans text-xs md:text-sm text-text-muted font-medium">
                  No billing history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
