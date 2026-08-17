import React from "react";

export default function DrawOverviewTab() {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn select-none">
      
      {/* Top Banner */}
      <div className="w-full bg-bg border border-border rounded-button p-8 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border border-emerald-200 bg-emerald-50 flex items-center justify-center mb-1 shadow-sm">
          <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <span className="font-heading font-bold text-[16px] text-text-primary">Draw Scheduled...</span>
        <span className="font-sans text-[13px] text-emerald-700 font-semibold">Will run automatically on 30 Jun 2025 14:00</span>
      </div>

      {/* Draw Timeline */}
      <div className="w-full bg-bg border border-border rounded-button p-6 pt-5 shadow-sm">
        <h3 className="font-heading font-bold text-[14px] text-text-primary mb-6">Draw Timeline</h3>
        
        <div className="flex flex-col relative before:absolute before:inset-0 before:ml-[11px] before:w-[2px] before:bg-divider">
          
          {/* Step 1 */}
          <div className="relative flex items-start gap-4 mb-8">
            <div className="w-6 h-6 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center shrink-0 z-10 shadow-sm">
              <svg className="w-3 h-3 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex flex-col -mt-0.5">
              <span className="font-sans font-semibold text-[13px] text-text-primary">Competition approved & published</span>
              <span className="font-sans text-[11px] text-text-muted mt-0.5 font-medium">System • 10 Jun 2025 14:00</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex items-start gap-4 mb-8">
            <div className="w-6 h-6 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center shrink-0 z-10 shadow-sm">
              <svg className="w-3 h-3 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex flex-col -mt-0.5">
              <span className="font-sans font-semibold text-[13px] text-text-primary">Ticket sales started</span>
              <span className="font-sans text-[11px] text-text-muted mt-0.5 font-medium">System • 10 Jun 2025 14:05</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex items-start gap-4 mb-8">
            <div className="w-6 h-6 rounded-full bg-surface border-2 border-border shrink-0 z-10"></div>
            <div className="flex flex-col -mt-0.5 opacity-60">
              <span className="font-sans font-semibold text-[13px] text-text-primary">Ticket sales closed</span>
              <span className="font-sans text-[11px] text-text-muted mt-0.5 font-medium">Waiting...</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative flex items-start gap-4 mb-8">
            <div className="w-6 h-6 rounded-full bg-surface border-2 border-border shrink-0 z-10"></div>
            <div className="flex flex-col -mt-0.5 opacity-60">
              <span className="font-sans font-semibold text-[13px] text-text-primary">Auto draw process started</span>
              <span className="font-sans text-[11px] text-text-muted mt-0.5 font-medium">...</span>
            </div>
          </div>

          {/* Step 5 */}
          <div className="relative flex items-start gap-4 mb-8">
            <div className="w-6 h-6 rounded-full bg-surface border-2 border-border shrink-0 z-10"></div>
            <div className="flex flex-col -mt-0.5 opacity-60">
              <span className="font-sans font-semibold text-[13px] text-text-primary">Winner verification saved</span>
              <span className="font-sans text-[11px] text-text-muted mt-0.5 font-medium">...</span>
            </div>
          </div>

          {/* Step 6 */}
          <div className="relative flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-surface border-2 border-border shrink-0 z-10"></div>
            <div className="flex flex-col -mt-0.5 opacity-60">
              <span className="font-sans font-semibold text-[13px] text-text-primary">Result published and notified</span>
              <span className="font-sans text-[11px] text-text-muted mt-0.5 font-medium">...</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
