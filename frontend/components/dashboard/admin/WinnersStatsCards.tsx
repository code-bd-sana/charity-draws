"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { winnerService } from "../../../services/winner.service";
import { winnerKeys } from "../../../hooks/queryKeys";

export default function WinnersStatsCards() {
  const { data: allWinners } = useQuery({
    queryKey: winnerKeys.adminStats("All"),
    queryFn: () => winnerService.getAdminWinners({ limit: 1 }),
  });

  const { data: pendingVerifications } = useQuery({
    queryKey: winnerKeys.adminStats("Pending Verification"),
    queryFn: () => winnerService.getAdminWinners({ limit: 1, verificationStatus: "PENDING" }),
  });

  const { data: pendingDeliveries } = useQuery({
    queryKey: winnerKeys.adminStats("Pending Delivery"),
    queryFn: () => winnerService.getAdminWinners({ limit: 1, status: "PENDING" }),
  });

  const totalCount = allWinners?.meta?.total || 0;
  const pendingVerifyCount = pendingVerifications?.meta?.total || 0;
  const pendingDeliveryCount = pendingDeliveries?.meta?.total || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
      
      {/* Total Winners */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Total Winners
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">{totalCount}</span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">All time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Verification */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Pending Verification
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">{pendingVerifyCount}</span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-amber-50 border border-amber-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-amber-700">Needs action</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prizes Pending Delivery */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
        <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Prizes Pending Delivery
        </span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-none">{pendingDeliveryCount}</span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
              <span className="font-sans font-semibold text-[10px] text-emerald-700">In transit</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
