import React from "react";

const MOCK_LOGS = [
  { id: 1, action: "Ticket sales opened for competition", details: "System • 10 Jun 10:00:00", type: "System" },
  { id: 2, action: "User (ID: 9812) purchased 4x tickets (#10243-#10246)", details: "Stripe • 12 Jun 10:15:33", type: "Payment", isStripe: true },
  { id: 3, action: "DB Check: 420 tickets internally verified", details: "System • 30 Jun 14:00:01", type: "System" },
  { id: 4, action: "Ticket sales closed — 420 total entries locked", details: "System • 30 Jun 14:00:02", type: "System" },
  { id: 5, action: "Auto draw initiated — RNG seed generated", details: "System • 30 Jun 14:00:03", type: "System" },
  { id: 6, action: "Draw in progress — Winner selection", details: "System • 30 Jun 14:00:04", type: "Compute" },
];

export default function DrawAuditLogTab() {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn select-none">
      <h3 className="font-heading font-bold text-[14px] text-text-primary">Draw Audit Log</h3>
      
      <div className="flex flex-col relative before:absolute before:inset-0 before:ml-[11px] before:w-[1px] before:bg-divider before:-z-10 z-0">
        
        {MOCK_LOGS.map((log) => (
          <div key={log.id} className="relative flex items-start gap-4 mb-6 last:mb-0">
            {/* Icon */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm ${
              log.isStripe 
                ? "bg-accent-bg border border-border-medium" 
                : "bg-surface border border-border"
            }`}>
              {log.isStripe ? (
                <svg className="w-3 h-3 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              )}
            </div>
            
            {/* Content Container */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 -mt-0.5">
              <div className="flex flex-col">
                <span className="font-sans font-semibold text-[13px] text-text-primary">{log.action}</span>
                <span className="font-sans text-[11px] text-text-muted mt-0.5 font-medium">{log.details}</span>
              </div>
              <div className="px-3 py-1 rounded-badge border border-border-medium bg-accent-bg self-start sm:self-auto shadow-sm">
                <span className="font-sans font-semibold text-[10px] text-text-brand uppercase tracking-wider">{log.type}</span>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
