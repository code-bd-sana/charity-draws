"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAdminSubscriptionStats } from "../../../hooks/useSubscriptionHooks";

const PLAN_COLOR_MAP: Record<string, string> = {
  pro: "#7131C8",      // Brand Purple
  premium: "#3B82F6",  // Blue
  free: "#10B981",     // Emerald
};

const FALLBACK_COLORS = ["#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6"];

export default function PlanDistributionChart() {
  const { data: stats, isLoading } = useAdminSubscriptionStats();

  const chartData = useMemo(() => {
    if (!stats || !stats.planDistribution) return [];

    return stats.planDistribution.map((item, index) => {
      const lower = item.name.toLowerCase();
      const mappedColor = PLAN_COLOR_MAP[lower] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
      return {
        ...item,
        color: mappedColor,
      };
    });
  }, [stats]);

  const activeSlices = useMemo(() => {
    return chartData.filter((d) => d.value > 0);
  }, [chartData]);

  const totalActive = stats?.totalActive ?? 0;

  return (
    <div className="bg-surface border border-border rounded-card p-5 sm:p-6 flex flex-col justify-between h-full min-h-[380px] shadow-card select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-base text-text-primary">
            Plan Distribution
          </span>
          <span className="px-2 py-0.5 rounded-badge bg-accent-bg border border-border-medium text-[10px] font-semibold text-text-brand">
            Live
          </span>
        </div>
        <span className="text-xs font-sans text-text-muted">
          Active: <strong className="text-text-primary font-bold">{totalActive}</strong>
        </span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-text-brand border-t-transparent rounded-full animate-spin mb-3" />
          <span className="font-sans text-xs text-text-muted font-medium">
            Loading distribution data...
          </span>
        </div>
      ) : (
        <>
          {/* Donut Chart with Centered Total */}
          <div className="my-3 relative w-full h-[210px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-surface border border-border px-3 py-2 rounded-card shadow-card text-xs">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="font-bold text-text-primary">
                              {data.name} Plan
                            </span>
                          </div>
                          <p className="text-text-muted">
                            <strong className="text-text-primary">{data.value}</strong> active{" "}
                            ({data.percentage})
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {activeSlices.length > 0 ? (
                  <Pie
                    data={activeSlices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={84}
                    paddingAngle={activeSlices.length > 1 ? 4 : 0}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                  >
                    {activeSlices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                ) : (
                  // Subtle placeholder donut if 0 active subscriptions
                  <Pie
                    data={[{ name: "Empty", value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={84}
                    dataKey="value"
                    stroke="none"
                    fill="#E5E7EB"
                    isAnimationActive={false}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label inside Donut Hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-heading font-bold text-3xl text-text-primary leading-none">
                {totalActive}
              </span>
              <span className="font-sans text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-1">
                Subscribers
              </span>
            </div>
          </div>

          {/* Bottom Grid Legend Cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-border mt-auto">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 bg-accent-bg/40 border border-border/80 rounded-card p-2.5 hover:border-border-medium hover:bg-accent-bg/60 transition-all shadow-sm"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className="font-sans font-medium text-[11px] text-text-muted truncate"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="font-sans font-bold text-sm text-text-primary">
                    {item.value}
                  </span>
                  <span className="font-sans text-[10px] text-text-muted font-medium">
                    {item.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
