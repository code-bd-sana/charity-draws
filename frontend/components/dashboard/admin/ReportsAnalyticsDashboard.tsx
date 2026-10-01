"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { useAdminReportsAnalytics } from "../../../hooks/useAdminHooks";
import { adminService } from "../../../services/admin.service";

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border rounded-button p-3 shadow-card select-none">
        <p className="font-sans text-[12px] text-text-muted mb-1 font-medium">{label}</p>
        <p className="font-heading font-bold text-[14px] text-text-brand">
          {prefix}{Number(payload[0].value || 0).toLocaleString(undefined, { minimumFractionDigits: prefix === '£' ? 2 : 0, maximumFractionDigits: prefix === '£' ? 2 : 0 })}{suffix}
        </p>
      </div>
    );
  }
  return null;
};

export default function ReportsAnalyticsDashboard() {
  const [timeFilter, setTimeFilter] = useState<string>("3M");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const filters = ["7D", "1M", "3M", "1Y"];
  const { data, isLoading, isFetching } = useAdminReportsAnalytics(timeFilter);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await adminService.downloadReportsCsv(timeFilter);
      toast.success(`Exported ${timeFilter} analytics report successfully!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to export report CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  const revenueTrend = data?.revenueTrend || [];
  const salesByCategory = data?.salesByCategory || [];
  const popularCompetitions = data?.popularCompetitions || [];
  const userGrowth = data?.userGrowth || [];
  const hostPerformance = data?.hostPerformance || [];
  const geographicData = data?.geographicDistribution || [];

  return (
    <div className="flex flex-col w-full animate-fadeIn select-none gap-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary mb-1">
            Reports & Analytics
          </h1>
          <p className="font-sans text-sm text-text-muted font-medium">
            Live overview of platform revenue, ticket volume, category performance, and member growth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Filter Buttons */}
          <div className="flex items-center gap-1 bg-surface border border-border rounded-button p-1 shadow-sm">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1 rounded-[6px] font-sans font-semibold text-[12px] transition-all cursor-pointer ${
                  timeFilter === filter
                    ? "bg-primary text-primary-text font-bold shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
                }`}
              >
                {filter}
              </button>
            ))}
            {isFetching && (
              <div className="w-3.5 h-3.5 mx-1 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
            )}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-button bg-accent-bg border border-border-medium hover:bg-primary hover:text-white text-text-brand font-sans font-semibold text-[12px] transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Download formatted CSV report"
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Period Revenue */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              {timeFilter} Revenue
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="font-heading font-bold text-3xl text-text-brand leading-none">
              {isLoading ? "..." : `£${(data?.summary.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <span className="font-sans text-[11px] text-text-muted mt-2">Ticket purchases & platform fees</span>
          </div>
        </div>

        {/* Tickets Sold */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Tickets Sold
            </span>
            <div className="w-7 h-7 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-primary">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="font-heading font-bold text-3xl text-text-primary leading-none">
              {isLoading ? "..." : (data?.summary.ticketsSold ?? 0).toLocaleString()}
            </span>
            <span className="font-sans text-[11px] text-text-muted mt-2">Active entries issued in {timeFilter}</span>
          </div>
        </div>

        {/* New Members */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              New Registrations
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="font-heading font-bold text-3xl text-text-primary leading-none">
              {isLoading ? "..." : (data?.summary.newUsers ?? 0).toLocaleString()}
            </span>
            <span className="font-sans text-[11px] text-text-muted mt-2">New accounts created</span>
          </div>
        </div>

        {/* Active Competitions */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Active Competitions
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871a2.25 2.25 0 0 1-1.591-.659l-.75-.75a2.25 2.25 0 0 0-1.591-.659h-.871c-.622 0-1.125.504-1.125 1.125v3.375m7.5-6V3.75A2.25 2.25 0 0 0 14.25 1.5h-4.5A2.25 2.25 0 0 0 7.5 3.75V12.75" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="font-heading font-bold text-3xl text-text-primary leading-none">
              {isLoading ? "..." : (data?.summary.activeCompetitions ?? 0).toLocaleString()}
            </span>
            <span className="font-sans text-[11px] text-text-muted mt-2">Currently live for entries</span>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Revenue Trend */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[340px] shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-[15px] text-text-primary">Revenue Trend</h3>
            <span className="font-sans text-[11px] font-semibold text-text-brand bg-accent-bg px-2 py-0.5 rounded-badge border border-border-medium">
              {timeFilter}
            </span>
          </div>
          <div className="flex-1 w-full min-h-0">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center font-sans text-xs text-text-muted animate-pulse">
                Loading revenue trend...
              </div>
            ) : revenueTrend.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center font-sans text-xs text-text-muted">
                No revenue recorded in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7131C8" />
                      <stop offset="100%" stopColor="#8A46E4" />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#80649D', fontSize: 11, fontFamily: 'inherit' }} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip prefix="£" />} cursor={{ stroke: '#E6D8F7', strokeWidth: 1 }} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={2.5} 
                    dot={false}
                    activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#7131C8', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[340px] shadow-card">
          <h3 className="font-heading font-bold text-[15px] text-text-primary mb-2">Sales by Category</h3>
          <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center font-sans text-xs text-text-muted animate-pulse">
                Loading categories...
              </div>
            ) : salesByCategory.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center font-sans text-xs text-text-muted">
                No category sales recorded yet.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByCategory}
                      cx="32%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      stroke="none"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip suffix="%" />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Dynamic Category Legend */}
                <div className="absolute right-[5%] top-1/2 -translate-y-1/2 flex flex-col gap-2.5 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                  {salesByCategory.map((cat, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></div>
                      <span className="font-sans text-[11px] text-text-muted truncate max-w-[90px] font-medium" title={cat.name}>
                        {cat.name}
                      </span>
                      <span className="font-sans font-bold text-[11px] text-text-primary ml-auto">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Most Popular Competitions */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[340px] shadow-card">
          <h3 className="font-heading font-bold text-[15px] text-text-primary mb-5">Most Popular Competitions</h3>
          <div className="flex flex-col gap-4 flex-1 justify-center overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="py-8 text-center text-text-muted font-sans text-xs animate-pulse">
                Loading popular competitions...
              </div>
            ) : popularCompetitions.length === 0 ? (
              <div className="py-8 text-center text-text-muted font-sans text-xs">
                No competition tickets sold yet.
              </div>
            ) : (
              popularCompetitions.map((comp, i) => {
                const maxVal = Math.max(...popularCompetitions.map(c => c.totalTickets || c.value), 1);
                const width = maxVal > 0 && comp.value > 0 ? (comp.value / maxVal) * 100 : 0;
                return (
                  <div key={i} className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-sans text-[11px] text-text-primary font-medium truncate max-w-[190px]" title={comp.name}>
                        {comp.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans font-bold text-[11px] text-text-brand">
                          {comp.value} sold
                        </span>
                        {comp.totalTickets > 0 && (
                          <span className="font-sans text-[10px] text-text-muted">
                            / {comp.totalTickets}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-bg h-[4px] rounded-badge overflow-hidden border border-divider">
                      <div className="h-full bg-primary rounded-badge transition-all duration-500" style={{ width: `${width}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* User Growth Over Time */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[340px] shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-[15px] text-text-primary">User Growth Over Time</h3>
            <span className="font-sans text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-badge">
              Active Members
            </span>
          </div>
          <div className="flex-1 w-full min-h-0">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center font-sans text-xs text-text-muted animate-pulse">
                Loading member growth...
              </div>
            ) : userGrowth.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center font-sans text-xs text-text-muted">
                No user registrations recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7131C8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7131C8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#80649D', fontSize: 11, fontFamily: 'inherit' }} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip prefix="Total users: " />} cursor={{ stroke: '#E6D8F7', strokeWidth: 1 }} />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#7131C8" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#areaGradient)" 
                    activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#7131C8', strokeWidth: 2 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Host Performance */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[340px] shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-bold text-[15px] text-text-primary">Host Performance</h3>
            <span className="font-sans text-[10px] text-text-muted font-medium">Sell-Through Rate</span>
          </div>
          <div className="flex flex-col flex-1 justify-center gap-4 overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="py-8 text-center text-text-muted font-sans text-xs animate-pulse">
                Loading host performance...
              </div>
            ) : hostPerformance.length === 0 ? (
              <div className="py-8 text-center text-text-muted font-sans text-xs">
                No active hosts recorded.
              </div>
            ) : (
              hostPerformance.map((host, i) => (
                <div key={i} className="flex flex-col gap-1.5 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-sans text-[11px] text-text-primary font-medium truncate max-w-[150px]" title={host.name}>
                        {host.name}
                      </span>
                      <span className="font-sans text-[10px] text-text-muted shrink-0">
                        ({host.rafflesCount} draw{host.rafflesCount === 1 ? '' : 's'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {host.revenue !== undefined && host.revenue > 0 && (
                        <span className="font-sans text-[11px] text-text-muted font-medium">
                          £{host.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                      <span className="font-sans font-bold text-[11px] text-text-brand min-w-[32px] text-right">
                        {host.percent}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-bg h-[4px] rounded-badge overflow-hidden border border-divider">
                    <div 
                      className="h-full bg-primary rounded-badge transition-all duration-500 ease-out" 
                      style={{ width: `${Math.min(100, Math.max(host.percent, 0))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Geographic Entry Distribution */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[340px] shadow-card">
          <h3 className="font-heading font-bold text-[15px] text-text-primary mb-5">Geographic Entry Distribution</h3>
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {isLoading ? (
              <div className="py-8 text-center text-text-muted font-sans text-xs animate-pulse">
                Loading geographic distribution...
              </div>
            ) : geographicData.length === 0 || geographicData.every((g) => g.count === 0) ? (
              <div className="py-8 text-center text-text-muted font-sans text-xs">
                No participant location data recorded yet.
              </div>
            ) : (
              geographicData.map((geo, i) => {
                const width = Math.min(100, Math.max(0, geo.value));
                return (
                  <div key={i} className="flex flex-col gap-1.5 w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-sans text-[11px] text-text-muted font-medium">{geo.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans font-bold text-[11px] text-text-brand">{geo.value}%</span>
                        {geo.count !== undefined && geo.count > 0 && (
                          <span className="font-sans text-[9px] text-text-muted">({geo.count})</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-bg h-[4px] rounded-badge overflow-hidden border border-divider">
                      <div className="h-full bg-primary rounded-badge transition-all duration-500" style={{ width: `${width}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
