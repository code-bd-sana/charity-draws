"use client";

import React, { useState } from "react";
import { cn } from "../../../../lib/utils";
import { useHostRaffles } from "../../../../hooks/useRaffleHooks";
import WinnerDetailsModal from "./WinnerDetailsModal";

export default function WinnersTable() {
  const [activeFilter, setActiveFilter] = useState<"All" | "ACTIVE" | "ENDED">("All");
  const [selectedDrawToView, setSelectedDrawToView] = useState<any | null>(null);
  
  const { data: response, isLoading } = useHostRaffles();
  const raffles = response?.data || [];

  const filteredDraws = raffles.filter((r: any) => {
    if (activeFilter === "All") return true;
    return r.status === activeFilter;
  });

  if (isLoading) {
    return (
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden flex flex-col mt-6 shadow-card select-none animate-in fade-in duration-300">
        <div className="p-6 border-b border-divider flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface">
          <div>
            <div className="h-6 w-36 bg-accent-bg rounded animate-pulse mb-2"></div>
            <div className="h-4 w-60 bg-accent-bg rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-52 bg-accent-bg rounded-button animate-pulse"></div>
        </div>
        <div className="w-full overflow-x-auto min-h-[400px]">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-accent-bg/30">
                <th className="py-3 px-6"><div className="h-3.5 w-20 bg-accent-bg rounded animate-pulse"></div></th>
                <th className="py-3 px-6"><div className="h-3.5 w-20 bg-accent-bg rounded animate-pulse"></div></th>
                <th className="py-3 px-6"><div className="h-3.5 w-20 bg-accent-bg rounded animate-pulse"></div></th>
                <th className="py-3 px-6 flex justify-end"><div className="h-3.5 w-20 bg-accent-bg rounded animate-pulse"></div></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-divider last:border-0 bg-surface">
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-2">
                      <div className="h-4.5 w-44 bg-accent-bg rounded animate-pulse"></div>
                      <div className="h-3.5 w-24 bg-accent-bg rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-20 bg-accent-bg rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-16 bg-accent-bg rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="h-9 w-28 bg-accent-bg rounded-button animate-pulse ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-border rounded-card overflow-hidden flex flex-col mt-6 shadow-card select-none">
      
      {/* Header & Filter Tabs */}
      <div className="p-6 border-b border-divider flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface">
        <div>
          <h3 className="font-heading font-bold text-base md:text-lg text-text-primary">
            My Competition Winners & Deliveries
          </h3>
          <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
            View winners (Instant Wins & Main Draw) and update prize delivery status.
          </p>
        </div>
        
        <div className="flex items-center gap-1 bg-bg p-1 rounded-button border border-border">
          {(["All", "ACTIVE", "ENDED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-1.5 rounded-button font-sans text-xs transition-all cursor-pointer",
                activeFilter === filter
                  ? "bg-primary border border-primary text-primary-text font-bold shadow-sm"
                  : "text-text-secondary hover:text-text-primary font-semibold"
              )}
            >
              {filter === "All" ? "All Competitions" : filter === "ACTIVE" ? "Active" : "Completed"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto min-h-[350px]">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="border-b border-divider bg-accent-bg/30">
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Competition Name
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                End / Draw Date
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Tickets Sold
              </th>
              <th className="py-3 px-6 text-right font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDraws.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-text-muted font-sans text-xs md:text-sm font-medium">
                  No competitions found.
                </td>
              </tr>
            ) : (
              filteredDraws.map((draw: any) => (
                <tr 
                  key={draw.id}
                  className="group transition-colors hover:bg-accent-bg/40 border-b border-divider last:border-b-0"
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">
                        {draw.title}
                      </span>
                      <span className="font-sans text-xs text-text-muted font-medium">
                        Status: <strong className="text-text-brand font-bold">{draw.status}</strong>
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-sans font-medium text-xs md:text-sm text-text-secondary">
                      {draw.endDate ? new Date(draw.endDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-sans font-semibold text-xs md:text-sm text-text-brand">
                      {draw.ticketsSold} / {draw.totalTickets}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => setSelectedDrawToView(draw)}
                      className="h-9 px-4 bg-accent-bg border border-border-medium text-text-brand hover:bg-primary hover:text-primary-text transition-all rounded-button inline-flex items-center justify-center font-sans font-semibold text-xs shadow-sm cursor-pointer"
                    >
                      🏆 View Winners & Delivery
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedDrawToView && (
        <WinnerDetailsModal
          isOpen={!!selectedDrawToView}
          onClose={() => setSelectedDrawToView(null)}
          raffle={selectedDrawToView}
        />
      )}
    </div>
  );
}
