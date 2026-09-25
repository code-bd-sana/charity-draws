import React from "react";

export default function UserSettingsPage() {
  return (
    <div className="flex flex-col items-center gap-6 max-w-[800px] mx-auto w-full animate-fadeIn select-none">
      {/* Header */}
      <div className="w-full">
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">Account Settings</h1>
        <p className="font-sans text-sm text-text-muted font-medium">
          Manage your privacy preferences, active sessions, and security settings.
        </p>
      </div>

      {/* Privacy Card */}
      <div className="w-full bg-surface border border-border rounded-card p-6 flex flex-col gap-6 shadow-card">
        <h2 className="font-heading font-bold text-[16px] text-text-primary border-b border-divider pb-3">
          Privacy Preferences
        </h2>
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[13px] text-text-primary">Show my name on public Winners page</span>
              <span className="font-sans text-[11px] text-text-muted font-medium">Your name will be visible in the Winners gallery</span>
            </div>
            {/* Active Toggle */}
            <div className="w-9 h-5 bg-primary rounded-full relative cursor-pointer shrink-0 transition-colors shadow-sm">
              <div className="absolute top-[2px] right-[2px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[13px] text-text-primary">Allow host messages</span>
              <span className="font-sans text-[11px] text-text-muted font-medium">Raffle hosts can send you messages about their raffles</span>
            </div>
            {/* Inactive Toggle */}
            <div className="w-9 h-5 bg-bg border border-border rounded-full relative cursor-pointer shrink-0 transition-colors">
              <div className="absolute top-[1.5px] left-[2px] w-4 h-4 bg-text-muted rounded-full shadow-sm transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="w-full bg-surface border border-border rounded-card p-6 flex flex-col gap-6 shadow-card">
        <h2 className="font-heading font-bold text-[16px] text-text-primary border-b border-divider pb-3">
          Security Settings
        </h2>
        
        <div className="flex items-center justify-between pb-6 border-b border-divider">
          <div className="flex flex-col gap-1">
            <span className="font-sans font-semibold text-[13px] text-text-primary">Two-Factor Authentication</span>
            <span className="font-sans text-[11px] text-text-muted font-medium">Add an extra layer of security to your account</span>
          </div>
          {/* Inactive Toggle */}
          <div className="w-9 h-5 bg-bg border border-border rounded-full relative cursor-pointer shrink-0 transition-colors">
            <div className="absolute top-[1.5px] left-[2px] w-4 h-4 bg-text-muted rounded-full shadow-sm transition-transform" />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <span className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Active Sessions
          </span>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[13px] text-text-primary">MacBook Pro — Chrome</span>
              <span className="font-sans text-[11px] font-semibold text-emerald-700">Manchester, UK • Current session</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[13px] text-text-primary">iPhone 14 — Safari</span>
              <span className="font-sans text-[11px] text-text-muted font-medium">Manchester, UK</span>
            </div>
            <button className="font-sans font-semibold text-[13px] text-red-600 hover:text-red-700 hover:underline transition-colors cursor-pointer">
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Delete My Account Card */}
      <div className="w-full bg-surface border border-red-200 rounded-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 shadow-card">
        <div className="flex flex-col gap-1">
          <span className="font-sans font-bold text-[13px] text-red-600">Delete My Account</span>
          <span className="font-sans text-[11px] text-text-muted font-medium">This action is permanent and cannot be undone</span>
        </div>
        
        <button className="px-6 py-2.5 rounded-button bg-red-600 hover:bg-red-700 text-white font-sans font-semibold text-[13px] transition-colors shrink-0 cursor-pointer shadow-sm">
          Delete Account
        </button>
      </div>

    </div>
  );
}
