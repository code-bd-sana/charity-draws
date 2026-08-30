"use client";

import React from "react";

export default function LiveDrawMonitor() {
  return (
    <div className="flex flex-col w-full bg-surface border border-border rounded-card p-6 mb-8 shadow-card select-none">
      <h3 className="font-heading font-bold text-[14px] text-text-primary mb-12">Live Draw Monitor</h3>
      
      <div className="flex flex-col items-center justify-center py-12 gap-6">
        {/* Pulsing Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-[80px] h-[80px] rounded-full bg-primary/10 animate-ping opacity-75"></div>
          <div className="w-[50px] h-[50px] rounded-full border-2 border-primary bg-accent-bg flex items-center justify-center z-10 shadow-sm">
            <svg className="w-6 h-6 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>
        
        {/* Text */}
        <p className="font-sans text-[13px] text-text-brand font-semibold">
          Drawing winner from <strong className="font-bold text-text-primary">89 verified entries</strong> for Night Vision Bundle...
        </p>
      </div>
    </div>
  );
}
