import React from "react";
import { HostDashboardStat } from "../../../../types/host-dashboard.types";
import { cn } from "../../../../lib/utils";

interface Props {
  metrics: HostDashboardStat[];
}

export default function SalesMetricsCards({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
      {metrics.map((metric) => (
        <div 
          key={metric.id}
          className="flex flex-col p-6 bg-surface border border-border rounded-card shadow-card hover:border-border-medium transition-all"
        >
          <span className="font-sans font-semibold text-xs md:text-sm text-text-muted mb-3">
            {metric.label}
          </span>
          <div className="flex items-end justify-between">
            <span className="font-heading font-bold text-2xl md:text-3xl text-text-primary leading-none">
              {metric.value}
            </span>
            <span 
              className={cn(
                "font-sans font-bold text-xs px-2 py-0.5 rounded-full border shadow-sm",
                metric.trend === "up" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                  : "bg-red-50 border-red-200 text-red-700"
              )}
            >
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
