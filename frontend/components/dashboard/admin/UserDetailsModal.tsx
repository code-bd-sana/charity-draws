"use client";

import React from "react";
import { format } from "date-fns";
import { User } from "../../../services/admin.service";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!isOpen || !user) return null;

  const getInitials = () => {
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user.firstName) return user.firstName[0].toUpperCase();
    return user.email[0].toUpperCase();
  };

  return (
    <>
      {/* Backdrop blur overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:max-w-[540px] max-h-[85vh] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-6 sm:p-7 font-sans select-none overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
          <h2 className="font-heading font-bold text-[18px] sm:text-[20px] text-text-primary">
            User Information
          </h2>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-button hover:bg-accent-bg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1">
          {/* Profile Card Section */}
          <div className="flex items-center gap-4 p-4 bg-bg border border-border rounded-button mb-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent-bg border-2 border-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="font-heading font-bold text-[20px] sm:text-[22px] text-text-brand tracking-wider">
                {getInitials()}
              </span>
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
              <h3 className="font-heading font-bold text-[15px] sm:text-[16px] text-text-primary truncate">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : "No Name Provided"}
              </h3>
              <span className="font-sans text-[12px] text-text-muted font-medium truncate">{user.email}</span>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-badge border border-border-medium bg-accent-bg text-text-brand font-sans font-semibold text-[9px] uppercase tracking-wider shadow-sm">
                  {user.role}
                </span>
                {user.isEmailVerified ? (
                  <span className="px-2.5 py-0.5 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-[9px] uppercase tracking-wider shadow-sm">
                    Verified
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-badge border border-amber-200 bg-amber-50 text-amber-700 font-sans font-semibold text-[9px] uppercase tracking-wider shadow-sm">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-bg border border-border rounded-button p-3.5 flex flex-col gap-1">
              <span className="font-sans text-[10px] font-semibold text-text-muted uppercase tracking-wider">Tickets Purchased</span>
              <span className="font-heading font-bold text-[18px] sm:text-[20px] text-text-primary">{user.ticketsCount}</span>
            </div>
            <div className="bg-bg border border-border rounded-button p-3.5 flex flex-col gap-1">
              <span className="font-sans text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Spent</span>
              <span className="font-heading font-bold text-[18px] sm:text-[20px] text-text-brand">£{user.totalSpent.toFixed(2)}</span>
            </div>
          </div>

          {/* Info list */}
          <div className="flex flex-col gap-3 font-sans text-[13px] border-t border-border pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-divider">
              <span className="text-text-muted font-semibold">Joined Date</span>
              <span className="text-text-primary font-medium">{format(new Date(user.createdAt), "dd MMMM yyyy HH:mm")}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-divider">
              <span className="text-text-muted font-semibold">Phone Number</span>
              <span className="text-text-primary font-medium">{user.phone || "Not provided"}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-divider">
              <span className="text-text-muted font-semibold">Location</span>
              <span className="text-text-primary font-medium">{user.location || "Not provided"}</span>
            </div>

            <div className="flex items-start justify-between pb-2 border-b border-divider">
              <span className="text-text-muted font-semibold shrink-0">Address</span>
              <span className="text-text-primary font-medium text-right max-w-[240px] line-clamp-3">{user.address || "Not provided"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted font-semibold">Status</span>
              <span>
                {user.isBlocked ? (
                  <span className="px-3 py-1 rounded-badge border border-red-200 bg-red-50 text-red-700 font-semibold text-[10px] shadow-sm">Blocked / Suspended</span>
                ) : (
                  <span className="px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold text-[10px] shadow-sm">Active / Operational</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center pt-3 border-t border-divider shrink-0">
          <button 
            onClick={onClose}
            className="w-full min-h-[44px] h-[44px] rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary font-sans font-semibold text-[14px] transition-all cursor-pointer shadow-sm flex items-center justify-center"
          >
            Close Details
          </button>
        </div>

      </div>
    </>
  );
}
