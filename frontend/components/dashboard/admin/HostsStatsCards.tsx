"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../../services/admin.service";
import { hostKeys } from "../../../hooks/queryKeys";

export default function HostsStatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: hostKeys.adminStats(),
    queryFn: () => adminService.getHostStats(),
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
      
      {/* Total Hosts */}
      <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Total Hosts
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl text-text-primary leading-none">
            {isLoading ? '...' : stats?.totalHosts || 0}
          </span>
          <span className="text-[11px] text-text-muted mt-2">Registered on platform</span>
        </div>
      </div>

      {/* Pending Review Hosts */}
      <div className={`bg-surface border rounded-card p-5 flex flex-col gap-2 shadow-card hover:shadow-glow transition-all duration-200 ${
        (stats?.pendingHosts || 0) > 0 ? "border-amber-300 bg-amber-50/20" : "border-border"
      }`}>
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Pending Approval
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl text-amber-600 leading-none">
            {isLoading ? '...' : stats?.pendingHosts || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`px-2.5 py-0.5 rounded-badge flex items-center justify-center shadow-sm ${
              (stats?.pendingHosts || 0) > 0 
                ? "bg-amber-100 border border-amber-300 text-amber-800" 
                : "bg-surface border border-border text-text-muted"
            }`}>
              <span className="font-sans font-semibold text-[10px]">
                {(stats?.pendingHosts || 0) > 0 ? "Requires Review" : "Queue Empty"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Hosts */}
      <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Active & Verified
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl text-emerald-600 leading-none">
            {isLoading ? '...' : stats?.activeHosts || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blocked Hosts */}
      <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Blocked Hosts
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl text-text-primary leading-none">
            {isLoading ? '...' : stats?.blockedHosts || 0}
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-red-50 border border-red-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-red-700">Suspended</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
