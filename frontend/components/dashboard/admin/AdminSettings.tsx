"use client";

import React from "react";

export default function AdminSettings() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-[800px] animate-fadeIn select-none">
      
      {/* Profile Settings */}
      <div className="bg-surface border border-border rounded-card p-8 flex flex-col gap-6 shadow-card">
        <div>
          <h2 className="font-heading font-bold text-[18px] text-text-primary">Profile Details</h2>
          <p className="font-sans text-[13px] text-text-muted mt-1 font-medium">Update your basic profile information.</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-sans font-semibold text-[13px] text-text-primary">Full Name</label>
            <input 
              type="text" 
              defaultValue="Admin Sarah K." 
              className="w-full h-[44px] bg-bg border border-border rounded-button px-4 text-[14px] text-text-primary outline-none focus:border-primary transition-colors font-sans"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans font-semibold text-[13px] text-text-primary">Email Address</label>
            <input 
              type="email" 
              defaultValue="admin@charitydraws.co.uk"
              className="w-full h-[44px] bg-bg border border-border rounded-button px-4 text-[14px] text-text-primary outline-none focus:border-primary transition-colors font-sans"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-2">
          <button className="h-[40px] px-6 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[13px] transition-all cursor-pointer shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-surface border border-border rounded-card p-8 flex flex-col gap-6 shadow-card">
        <div>
          <h2 className="font-heading font-bold text-[18px] text-text-primary">Change Password</h2>
          <p className="font-sans text-[13px] text-text-muted mt-1 font-medium">Ensure your account is using a long, random password to stay secure.</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-sans font-semibold text-[13px] text-text-primary">Current Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full h-[44px] bg-bg border border-border rounded-button px-4 text-[14px] text-text-primary outline-none focus:border-primary transition-colors font-sans"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans font-semibold text-[13px] text-text-primary">New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full h-[44px] bg-bg border border-border rounded-button px-4 text-[14px] text-text-primary outline-none focus:border-primary transition-colors font-sans"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-sans font-semibold text-[13px] text-text-primary">Confirm New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full h-[44px] bg-bg border border-border rounded-button px-4 text-[14px] text-text-primary outline-none focus:border-primary transition-colors font-sans"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-2">
          <button className="h-[40px] px-6 rounded-button bg-accent-bg border border-border-medium hover:bg-primary hover:text-white text-text-brand font-sans font-semibold text-[13px] transition-all cursor-pointer shadow-sm">
            Update Password
          </button>
        </div>
      </div>
      
    </div>
  );
}
