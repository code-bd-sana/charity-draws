"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { HostSalesChartDataPoint } from "../../../../types/host-dashboard.types";

interface Props {
  data: HostSalesChartDataPoint[];
}

export default function SalesChart({ data }: Props) {
  return (
    <div className="w-full bg-surface border border-border rounded-card p-6 shadow-card select-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-bold text-base md:text-lg text-text-primary">
            Revenue Overview
          </h3>
          <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
            Ticket sales across all active competitions over the last 7 days.
          </p>
        </div>
        <select className="bg-bg border border-border rounded-button px-3 py-1.5 font-sans font-semibold text-xs text-text-primary outline-none hover:border-border-medium transition-all cursor-pointer">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7131C8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7131C8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E8FA" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#60407F", fontSize: 12, fontFamily: "Inter" }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#60407F", fontSize: 12, fontFamily: "Inter" }}
              tickFormatter={(val) => `£${val}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#FFFFFF", 
                border: "1px solid #CDAFEA",
                borderRadius: "12px",
                fontFamily: "Inter",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
              }}
              itemStyle={{ color: "#351365", fontWeight: 700 }}
              labelStyle={{ color: "#7131C8", fontWeight: 700, marginBottom: "4px" }}
              formatter={(value: any) => [`£${value}`, "Revenue"]}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#7131C8" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
