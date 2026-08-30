import React from "react";
import { HostDashboardStat } from "../../../types/host-dashboard.types";
import { cn } from "../../../lib/utils";

interface HostStatCardProps {
  stat: HostDashboardStat;
}

export default function HostStatCard({ stat }: HostStatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-card p-5 flex flex-col justify-between h-[115px] w-full shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-200 select-none">
      <div className="w-full">
        <p className="font-sans font-semibold text-[11px] leading-tight tracking-wider uppercase text-text-muted">
          {stat.label}
        </p>
      </div>
      <div className="w-full flex items-end justify-between mt-auto">
        <div className="h-10 flex items-center">
          <p className="font-heading font-bold text-2xl md:text-3xl text-text-primary tracking-tight">
            {stat.value}
          </p>
        </div>
        {stat.change && (
          <div className={cn(
            "rounded-badge px-2.5 py-1 flex items-center gap-1 border shadow-sm",
            stat.trend === "up" ? "bg-accent-bg border-border-medium text-text-brand" : "bg-red-50 border-red-200 text-red-700"
          )}>
            <span className="font-sans font-semibold text-[11px] leading-none">
              {stat.change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
