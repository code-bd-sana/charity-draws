"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { PerformanceRevenueDataPoint } from "../../../../types/host-dashboard.types";

interface Props {
  data: PerformanceRevenueDataPoint[];
}

export default function RevenueTrendChart({ data = [] }: Props) {
  return (
    <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-[360px] shadow-card select-none">
      <h3 className="font-heading font-bold text-base md:text-lg text-text-primary mb-6">
        Revenue Trend
      </h3>
      
      <div className="flex-1 w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7131C8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7131C8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#60407F", fontSize: 12, fontFamily: "Inter" }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#60407F", fontSize: 12, fontFamily: "Inter" }}
              tickFormatter={(val) => `£${val / 1000}k`}
              dx={-10}
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
