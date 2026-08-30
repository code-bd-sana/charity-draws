"use client";

import React, { useState } from "react";
import { HostSalesRaffle } from "../../../../services/host-wallet.service";
import { cn } from "../../../../lib/utils";

interface Props {
  raffles: HostSalesRaffle[];
  isLoading?: boolean;
}

export default function SalesBreakdownTable({ raffles, isLoading = false }: Props) {
  const [activeTab, setActiveTab] = useState("All");
  
  const tabs = ["All", "Active", "Completed"];
  
  const filteredRaffles = raffles.filter(r => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") return r.status === "Live";
    if (activeTab === "Completed") return r.status === "Completed";
    return true;
  });

  return (
    <div className="w-full bg-surface border border-border rounded-card overflow-hidden flex flex-col mt-6 shadow-card select-none">
      
      {/* Header & Tabs */}
      <div className="p-6 border-b border-divider flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface">
        <div>
          <h3 className="font-heading font-bold text-base md:text-lg text-text-primary">
            Competition Breakdown
          </h3>
          <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
            Individual performance metrics for your raffles.
          </p>
        </div>
        
        <div className="flex items-center gap-1 bg-bg p-1 rounded-button border border-border">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-button font-sans text-xs transition-all cursor-pointer",
                activeTab === tab
                  ? "bg-primary border border-primary text-primary-text font-bold shadow-sm"
                  : "text-text-secondary hover:text-text-primary font-semibold"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="border-b border-divider bg-accent-bg/30">
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Item
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Tickets Sold
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Price
              </th>
              <th className="py-3 px-6 font-sans font-semibold text-[11px] text-text-muted uppercase tracking-wider">
                Gross Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 4 }).map((_, index) => (
              <tr key={index} className="border-b border-divider last:border-b-0">
                {["w-48", "w-20", "w-24", "w-16", "w-20"].map((width, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4">
                    <div className={`h-4 ${width} animate-pulse rounded bg-accent-bg`} />
                  </td>
                ))}
              </tr>
            ))}

            {!isLoading && filteredRaffles.map((raffle) => (
              <tr 
                key={raffle.id}
                className="group transition-colors hover:bg-accent-bg/40 border-b border-divider last:border-b-0"
              >
                <td className="py-4 px-6">
                  <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">
                    {raffle.name}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={cn(
                    "inline-flex px-2.5 py-0.5 rounded-badge font-sans font-bold text-[11px] border shadow-sm",
                    raffle.status === "Live" && "bg-emerald-50 border-emerald-200 text-emerald-700",
                    raffle.status === "Completed" && "bg-purple-50 border-border-medium text-text-brand",
                    (raffle.status === "Draft" || raffle.status === "Pending Review") && "bg-amber-50 border-amber-200 text-amber-700",
                    raffle.status === "Cancelled" && "bg-red-50 border-red-200 text-red-700"
                  )}>
                    {raffle.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-sans font-semibold text-xs md:text-sm text-text-brand">
                      {raffle.ticketsSold} <span className="text-text-muted font-medium">/ {raffle.totalTickets}</span>
                    </span>
                    {/* Tiny Progress bar */}
                    <div className="w-full max-w-[100px] h-1.5 bg-accent-bg border border-border-medium rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${raffle.totalTickets > 0 ? Math.min(100, (raffle.ticketsSold / raffle.totalTickets) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-sans font-medium text-xs md:text-sm text-text-secondary">
                    £{raffle.ticketPrice.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-heading font-bold text-xs md:text-sm text-text-primary">
                    £{raffle.grossRevenue.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}

            {!isLoading && filteredRaffles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center font-sans text-sm font-medium text-text-muted">
                  No competitions match this filter yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
