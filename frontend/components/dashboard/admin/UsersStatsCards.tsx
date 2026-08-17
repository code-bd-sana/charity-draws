"use client";

import React from "react";
import { useAdminUsersStats } from "../../../hooks/useAdminHooks";

export default function UsersStatsCards() {
  const { data: stats, isLoading, isError } = useAdminUsersStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-card h-[120px] shadow-sm" />
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return <div className="text-red-500 font-sans font-semibold">Failed to load statistics.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 select-none">
      
      {/* Total Users */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Total Users
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">
            {stats.totalUsers.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">All time</span>
            </div>
          </div>
        </div>
      </div>

      {/* New This Month */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          New This Month
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">
            {stats.newThisMonth.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">This month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Active Users
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">
            {stats.activeUsers.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">{stats.activePercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blocked Users */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Blocked Users
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">
            {stats.blockedUsers.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-red-50 border border-red-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-red-700">{stats.blockedPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
