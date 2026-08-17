"use client";

import React from "react";
import { PerformanceDemographic } from "../../../../types/host-dashboard.types";

interface Props {
  data: PerformanceDemographic[];
}

export default function DemographicsList({ data = [] }: Props) {
  return (
    <div className="bg-surface border border-border rounded-card p-6 flex flex-col flex-1 shadow-card select-none">
      <h3 className="font-heading font-bold text-base md:text-lg text-text-primary mb-6">
        Entrant Demographics
      </h3>
      
      <div className="flex flex-col gap-5">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="font-sans font-semibold text-text-primary">
                {item.region}
              </span>
              <span className="font-sans font-bold text-text-brand">
                {item.percentage}%
              </span>
            </div>
            
            {/* Progress Bar Container */}
            <div className="w-full bg-accent-bg border border-border-medium h-2 rounded-full overflow-hidden">
              <div 
                className="bg-accent-purple h-full rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
