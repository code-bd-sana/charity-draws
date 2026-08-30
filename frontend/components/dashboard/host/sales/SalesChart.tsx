"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HostSalesChartDataPoint } from "../../../../types/host-dashboard.types";
import { HostSalesRange } from "../../../../services/host-wallet.service";

interface Props {
  data: HostSalesChartDataPoint[];
  range: HostSalesRange;
  onRangeChange: (range: HostSalesRange) => void;
  isLoading?: boolean;
}

const rangeLabels: Record<HostSalesRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "12m": "Last 12 months",
};

export default function SalesChart({ data, range, onRangeChange, isLoading = false }: Props) {
  const hasSales = data.some((point) => point.revenue > 0);

  return (
    <div className="w-full rounded-card border border-border bg-surface p-6 shadow-card select-none">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-base font-bold text-text-primary md:text-lg">
            Revenue Overview
          </h3>
          <p className="font-sans text-xs font-medium text-text-muted md:text-sm">
            Completed ticket sales for the selected period.
          </p>
        </div>
        <select
          value={range}
          onChange={(event) => onRangeChange(event.target.value as HostSalesRange)}
          disabled={isLoading}
          className="cursor-pointer rounded-button border border-border bg-bg px-3 py-1.5 font-sans text-xs font-semibold text-text-primary outline-none transition-all hover:border-border-medium disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Sales date range"
        >
          {Object.entries(rangeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative h-[300px] w-full">
        {isLoading ? (
          <div className="flex h-full items-end gap-3 px-6 pb-8">
            {[44, 66, 38, 78, 55, 88, 64].map((height, index) => (
              <div
                key={index}
                className="flex-1 animate-pulse rounded-t bg-accent-bg"
                style={{ height: `${height}%`, animationDelay: `${index * 80}ms` }}
              />
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesRevenueGradient" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(value: number) => `£${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CDAFEA",
                  borderRadius: "12px",
                  fontFamily: "Inter",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                }}
                itemStyle={{ color: "#351365", fontWeight: 700 }}
                labelStyle={{ color: "#7131C8", fontWeight: 700, marginBottom: "4px" }}
                formatter={(value) => {
                  const revenue = Array.isArray(value) ? value[0] : value;
                  return [`£${Number(revenue ?? 0).toFixed(2)}`, "Revenue"];
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7131C8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salesRevenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {!isLoading && !hasSales && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-badge border border-border bg-surface px-4 py-2 font-sans text-xs font-medium text-text-muted shadow-card">
              No completed ticket sales in this period.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
