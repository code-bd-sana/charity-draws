"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useAdminSubscriptionStats } from "../../../hooks/useSubscriptionHooks";

const COLORS = [
  "#7131C8", // Primary Purple
  "#8A46E4", // Accent Purple
  "#A866F4", // Light Purple
  "#CDAFEA", // Soft Violet
  "#5420AB", // Dark Violet
];

export default function PlanDistributionChart() {
  const { data: stats, isLoading } = useAdminSubscriptionStats();

  const chartData = useMemo(() => {
    if (!stats || !stats.planDistribution) return [];
    
    return stats.planDistribution.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length]
    }));
  }, [stats]);

  return (
    <div className="bg-surface border border-border rounded-card p-6 flex flex-col h-full min-h-[360px] shadow-card select-none">
      <span className="font-heading font-bold text-base text-text-primary mb-6">Plan Distribution</span>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-sans text-[13px] text-text-muted font-medium">Loading chart data...</span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-sans text-[13px] text-text-muted font-medium">No active subscriptions found.</span>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-between gap-6">
          
          {/* Chart */}
          <div className="flex-1 h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-4 justify-center w-[160px]">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" 
                  style={{ backgroundColor: item.color }} 
                />
                <div className="flex items-baseline gap-1.5 flex-1">
                  <span className="font-sans font-medium text-[12px] text-text-muted w-[50px] truncate" title={item.name}>{item.name}</span>
                  <span className="font-sans font-bold text-[13px] text-text-primary">{item.value}</span>
                  <span className="font-sans text-[11px] text-text-muted">({item.percentage})</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
