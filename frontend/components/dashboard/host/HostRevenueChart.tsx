"use client";

import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useHostPerformanceAnalytics } from "../../../hooks/useHostWalletHooks";

interface HostRevenueChartProps {
  totalRevenue?: number;
}

const TIMEFRAMES = ["7D", "1M", "3M", "1Y"];

export default function HostRevenueChart({ totalRevenue }: HostRevenueChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("1M");
  const { data: analytics, isLoading } = useHostPerformanceAnalytics(activeTimeframe);

  const chartData = analytics?.revenueTrend ?? [];

  const displayRevenue = totalRevenue !== undefined 
    ? `£${Number(totalRevenue).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "£0.00";

  return (
    <div className="bg-surface border border-border rounded-card p-6 w-full flex flex-col h-full min-h-[362px] shadow-card select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-heading font-bold text-base md:text-lg text-text-primary">
          Earnings Overview
        </h2>
        
        {/* Time filters */}
        <div className="flex gap-1.5">
          {TIMEFRAMES.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveTimeframe(filter)}
              className={`rounded-badge px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                filter === activeTimeframe
                  ? "bg-primary border-primary text-primary-text font-bold shadow-glow"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <p className="font-heading font-bold text-3xl md:text-4xl text-text-brand tracking-tight">
          {displayRevenue}
        </p>
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-2.5 py-0.5 rounded-badge text-xs flex items-center gap-1 shadow-sm">
          <span>▲ Live</span>
        </div>
      </div>

      <div className="flex-1 w-full pt-5 relative min-h-[200px] -ml-3">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="hostRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7131C8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7131C8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#60407F", fontSize: 11, fontFamily: "Inter" }} 
                dy={5}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#60407F", fontSize: 11, fontFamily: "Inter" }}
                tickFormatter={(val) => `£${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              />
              <Tooltip
                cursor={{ stroke: "#CDAFEA", strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={{ 
                  backgroundColor: "#FFFFFF", 
                  borderColor: "#CDAFEA", 
                  borderRadius: "12px",
                  fontFamily: "Inter",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
                }}
                itemStyle={{ color: "#351365", fontWeight: 700 }}
                labelStyle={{ color: "#7131C8", fontWeight: 700, marginBottom: "4px" }}
                formatter={(value: any) => [`£${Number(value).toFixed(2)}`, "Earnings"]}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#7131C8" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#hostRevenueGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
