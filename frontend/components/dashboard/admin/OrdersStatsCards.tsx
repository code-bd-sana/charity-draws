"use client";

import React from "react";
import { useAdminOrdersStats } from "../../../hooks/useAdminHooks";

export default function OrdersStatsCards() {
  const { data: stats, isLoading } = useAdminOrdersStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 select-none">
      
      {/* Total Orders */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Total Orders
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : stats?.totalOrders?.toLocaleString() || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">Transactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Tickets Sold */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Total Tickets Sold
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : stats?.totalTicketsSold?.toLocaleString() || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">Tickets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Order Value */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Total Order Value
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-brand leading-none">
            {isLoading ? "..." : `£${stats?.totalOrderValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Refunded Orders */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Refunded Orders
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">
            {isLoading ? "..." : stats?.refundedOrders?.toLocaleString() || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-red-50 border border-red-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-red-700">Refunded</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
