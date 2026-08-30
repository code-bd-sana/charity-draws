"use client";

import React, { useState } from "react";
import RevenueTrendChart from "../../../../components/dashboard/host/performance/RevenueTrendChart";
import CategorySalesChart from "../../../../components/dashboard/host/performance/CategorySalesChart";
import TopRafflesList from "../../../../components/dashboard/host/performance/TopRafflesList";
import DemographicsList from "../../../../components/dashboard/host/performance/DemographicsList";
import { useHostPerformanceAnalytics } from "../../../../hooks/useHostWalletHooks";
import { cn } from "../../../../lib/utils";

const TIMEFRAMES = ["7D", "1M", "3M", "1Y"];

export default function PerformanceStatsPage() {
  const [activeTimeframe, setActiveTimeframe] = useState("1M");
  const { data: analytics, isLoading } = useHostPerformanceAnalytics(activeTimeframe);

  const revenueTrendData = analytics?.revenueTrend ?? [];
  const categorySalesData = analytics?.categorySales ?? [];
  const topRafflesData = analytics?.topRaffles ?? [];
  const demographicsData = analytics?.demographics ?? [];

  return (
    <div className="flex-1 w-full px-[20px] lg:px-[40px] py-[24px] lg:py-[32px] flex flex-col gap-[24px] animate-in fade-in zoom-in-95 duration-300 select-none">
      
      {/* Header & Timeframes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-text-primary">
            Performance Analytics
          </h1>
          <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
            Analyze your revenue trends, category breakdown, and entrant demographics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center font-sans text-xs transition-all cursor-pointer",
                activeTimeframe === tf
                  ? "bg-primary border border-primary text-primary-text font-bold shadow-sm"
                  : "bg-surface border border-border text-text-secondary hover:border-border-medium hover:text-text-primary font-semibold"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {/* Top Row: Revenue Trend & Category Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
            <div className="lg:col-span-2">
              <RevenueTrendChart data={revenueTrendData} />
            </div>
            <div className="lg:col-span-1">
              <CategorySalesChart data={categorySalesData} />
            </div>
          </div>

          {/* Bottom Row: Top Raffles & Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
            <TopRafflesList data={topRafflesData} />
            <DemographicsList data={demographicsData} />
          </div>
        </>
      )}

    </div>
  );
}
