"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

const REVENUE_DATA = [
  { name: 'Feb', value: 15000 },
  { name: 'Mar', value: 18000 },
  { name: 'Apr', value: 14000 },
  { name: 'May', value: 22000 },
  { name: 'Jun', value: 28400 },
  { name: 'Jul', value: 31000 },
  { name: 'Aug', value: 29000 },
  { name: 'Sep', value: 34000 },
  { name: 'Oct', value: 32000 },
  { name: 'Nov', value: 25000 },
  { name: 'Dec', value: 20000 },
];

const USER_GROWTH_DATA = [
  { name: 'Feb', users: 1500 },
  { name: 'Mar', users: 2400 },
  { name: 'Apr', users: 2900 },
  { name: 'May', users: 3800 },
  { name: 'Jun', users: 5100 },
];

const CATEGORY_DATA = [
  { name: 'Rifles', value: 45, color: '#7131C8' },
  { name: 'Pistols', value: 25, color: '#8A46E4' },
  { name: 'Gear', value: 20, color: '#A866F4' },
  { name: 'Optics', value: 10, color: '#CDAFEA' },
];

const POPULAR_COMPETITIONS = [
  { name: 'Sniper Rifle Set', value: 420 },
  { name: 'VFC HK416 Bundle', value: 345 },
  { name: 'Tactical Pistol Set', value: 250 },
  { name: 'Night Vision', value: 200 },
  { name: 'Ghillie Suit', value: 150 },
];

const HOST_PERFORMANCE = [
  { name: 'Tactical UK', percent: 90 },
  { name: 'Charity World', percent: 75 },
  { name: 'Combat Zone', percent: 65 },
  { name: 'Elite', percent: 55 },
  { name: 'Strike', percent: 45 },
];

const GEOGRAPHIC_DATA = [
  { name: 'England', value: 55 },
  { name: 'Scotland', value: 18 },
  { name: 'Wales', value: 12 },
  { name: 'N. Ireland', value: 8 },
  { name: 'Other', value: 7 },
];

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border rounded-button p-3 shadow-card select-none">
        <p className="font-sans text-[12px] text-text-muted mb-1 font-medium">{label}</p>
        <p className="font-heading font-bold text-[14px] text-text-brand">
          {prefix}{payload[0].value.toLocaleString()}{suffix}
        </p>
      </div>
    );
  }
  return null;
};

export default function ReportsAnalyticsDashboard() {
  const [timeFilter, setTimeFilter] = useState("3M");
  const filters = ["7D", "1M", "3M", "1Y"];

  return (
    <div className="flex flex-col w-full animate-fadeIn select-none">
      
      {/* Header & Filters */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">Reports & Analytics</h1>
          <p className="font-sans text-sm text-text-muted font-medium">
            Comprehensive overview of platform performance, sales, and user growth.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`w-[44px] h-[32px] rounded-badge font-sans font-semibold text-[12px] transition-all cursor-pointer ${
                timeFilter === filter
                  ? "bg-primary border-primary text-primary-text font-bold shadow-sm"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue Trend */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[320px] shadow-card">
          <h3 className="font-heading font-bold text-[15px] text-text-primary mb-6">Revenue Trend</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[320px] shadow-card">
          <h3 className="font-heading font-bold text-[15px] text-text-primary mb-2">Sales by Category</h3>
          <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="35%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  stroke="none"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip suffix="%" />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legend */}
            <div className="absolute right-[10%] top-1/2 -translate-y-1/2 flex flex-col gap-4">
              {CATEGORY_DATA.map((cat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="font-sans text-[12px] text-text-muted w-[45px] font-medium">{cat.name}</span>
                  <span className="font-sans font-bold text-[12px] text-text-primary">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Popular Competitions */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[320px] shadow-card">
          <h3 className="font-heading font-bold text-[15px] text-text-primary mb-6">Most Popular Competitions</h3>
          <div className="flex flex-col gap-5 flex-1 justify-center">
            {POPULAR_COMPETITIONS.map((comp, i) => {
              const width = Math.max((comp.value / 420) * 100, 5);
              return (
                <div key={i} className="flex flex-col gap-1.5 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-sans text-[11px] text-text-muted font-medium">{comp.name}</span>
                    <span className="font-sans font-bold text-[11px] text-text-brand">{comp.value}</span>
                  </div>
                  <div className="w-full bg-bg h-[4px] rounded-badge overflow-hidden border border-divider">
                    <div className="h-full bg-primary rounded-badge" style={{ width: `${width}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Growth Over Time */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[320px] shadow-card">
          <h3 className="font-heading font-bold text-[15px] text-text-primary mb-6">User Growth Over Time</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USER_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Tooltip content={<CustomTooltip prefix="users: " />} cursor={{ stroke: '#E6D8F7', strokeWidth: 1 }} />
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
          </div>
        </div>

        {/* Host Performance */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[320px] shadow-card">
          <h3 className="font-heading font-bold text-[15px] text-text-primary mb-6">Host Performance</h3>
          <div className="flex flex-col flex-1 justify-center gap-[14px]">
            {HOST_PERFORMANCE.map((host, i) => (
              <div key={i} className="flex items-center gap-4 w-full">
                <span className="font-sans text-[11px] text-text-muted w-[70px] text-right truncate shrink-0 font-medium">{host.name}</span>
                <div className="flex-1 h-[24px] bg-bg border border-divider rounded-button overflow-hidden flex items-center group">
                  <div 
                    className="h-full bg-primary rounded-r-button transition-all duration-500 ease-out flex items-center justify-end pr-2 group-hover:bg-primary-hover" 
                    style={{ width: `${host.percent}%` }}
                  >
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Entry Distribution */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[320px] shadow-card">
          <h3 className="font-heading font-bold text-[15px] text-text-primary mb-6">Geographic Entry Distribution</h3>
          <div className="flex flex-col gap-5 flex-1 justify-center">
            {GEOGRAPHIC_DATA.map((geo, i) => {
              const width = Math.max(geo.value, 2);
              return (
                <div key={i} className="flex flex-col gap-1.5 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-sans text-[11px] text-text-muted font-medium">{geo.name}</span>
                    <span className="font-sans font-bold text-[11px] text-text-brand">{geo.value}%</span>
                  </div>
                  <div className="w-full bg-bg h-[4px] rounded-badge overflow-hidden border border-divider">
                    <div className="h-full bg-primary rounded-badge" style={{ width: `${width}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
