import React from "react";
import { HostDashboardStat } from "../../../../types/host-dashboard.types";
import { cn } from "../../../../lib/utils";

interface Props {
  metrics: HostDashboardStat[];
  isLoading?: boolean;
}

export default function SalesMetricsCards({ metrics, isLoading = false }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
      {metrics.map((metric) => (
        <div 
          key={metric.id}
          className="flex flex-col p-6 bg-surface border border-border rounded-card shadow-card hover:border-border-medium transition-all"
        >
          {isLoading ? (
            <>
              <div className="mb-4 h-4 w-28 animate-pulse rounded bg-accent-bg" />
              <div className="flex items-end justify-between">
                <div className="h-8 w-24 animate-pulse rounded bg-accent-bg" />
                <div className="h-5 w-16 animate-pulse rounded-badge bg-accent-bg" />
              </div>
            </>
          ) : (
            <>
              <span className="mb-3 font-sans text-xs font-semibold text-text-muted md:text-sm">
                {metric.label}
              </span>
              <div className="flex items-end justify-between gap-3">
                <span className="font-heading text-2xl font-bold leading-none text-text-primary md:text-3xl">
                  {metric.value}
                </span>
                {metric.change && (
                  <span
                    className={cn(
                      "rounded-badge border px-2 py-0.5 font-sans text-xs font-bold shadow-sm",
                      metric.trend === "up"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : metric.trend === "down"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-border bg-accent-bg text-text-brand"
                    )}
                  >
                    {metric.change}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
