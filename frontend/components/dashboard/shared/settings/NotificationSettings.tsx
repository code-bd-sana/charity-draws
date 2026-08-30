"use client";

import React, { useState } from "react";

export default function NotificationSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [newCompetitions, setNewCompetitions] = useState(true);

  return (
    <div className="bg-surface border border-border rounded-card p-6 md:p-8 flex flex-col gap-6 shadow-card select-none animate-fadeIn">
      <div>
        <h2 className="font-heading font-bold text-lg md:text-xl text-text-primary">Notifications</h2>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium mt-1">Manage how and when you receive alerts from Charity Draws.</p>
      </div>

      <div className="h-px w-full bg-divider" />

      <div className="flex flex-col gap-4">
        
        {/* Toggle 1 */}
        <div className="flex items-center justify-between py-2 border-b border-divider">
          <div className="flex flex-col gap-1 pr-6">
            <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">Essential Account Alerts</span>
            <span className="font-sans text-xs text-text-muted font-medium">Receive emails about password changes, successful purchases, and active ticket numbers.</span>
          </div>
          <button 
            type="button"
            onClick={() => setEmailAlerts(!emailAlerts)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 shadow-sm cursor-pointer ${emailAlerts ? 'bg-primary' : 'bg-accent-bg border border-border-medium'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-surface transition-transform shadow-sm ${emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Toggle 2 */}
        <div className="flex items-center justify-between py-2 border-b border-divider">
          <div className="flex flex-col gap-1 pr-6">
            <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">New Competitions & Draws</span>
            <span className="font-sans text-xs text-text-muted font-medium">Get notified when new competitions drop or when live draws are about to begin.</span>
          </div>
          <button 
            type="button"
            onClick={() => setNewCompetitions(!newCompetitions)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 shadow-sm cursor-pointer ${newCompetitions ? 'bg-primary' : 'bg-accent-bg border border-border-medium'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-surface transition-transform shadow-sm ${newCompetitions ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Toggle 3 */}
        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col gap-1 pr-6">
            <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">Marketing & Promotions</span>
            <span className="font-sans text-xs text-text-muted font-medium">Receive special offers, discount codes, and platform news.</span>
          </div>
          <button 
            type="button"
            onClick={() => setMarketing(!marketing)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 shadow-sm cursor-pointer ${marketing ? 'bg-primary' : 'bg-accent-bg border border-border-medium'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-surface transition-transform shadow-sm ${marketing ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

      </div>

    </div>
  );
}
