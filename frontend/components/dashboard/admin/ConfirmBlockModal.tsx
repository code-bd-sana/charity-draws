"use client";

import React from "react";

interface ConfirmBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  isBlocked: boolean;
  userIdentifier: string;
}

export default function ConfirmBlockModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false,
  isBlocked,
  userIdentifier
}: ConfirmBlockModalProps) {
  if (!isOpen) return null;

  const actionText = isBlocked ? "Unblock" : "Block";
  const actionColor = isBlocked ? "text-emerald-700 font-bold" : "text-red-700 font-bold";
  const buttonBg = isBlocked 
    ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700" 
    : "bg-red-50 hover:bg-red-100 border-red-200 text-red-700";

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined} 
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-8 select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-[20px] text-text-primary">
            Confirm Action
          </h2>
          <button 
            onClick={!isLoading ? onClose : undefined}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 mb-8">
          <p className="font-sans text-[14px] text-text-primary leading-relaxed font-medium">
            Are you sure you want to <strong className={actionColor}>{actionText.toLowerCase()}</strong> this user?
          </p>
          <div className="bg-bg border border-border rounded-button p-4">
            <span className="font-sans text-[12px] text-text-muted block mb-1 font-semibold">User / Host:</span>
            <span className="font-sans font-bold text-[14px] text-text-brand break-all">{userIdentifier}</span>
          </div>
          {isBlocked ? (
            <p className="font-sans text-[12px] text-text-muted font-medium">
              Unblocking will restore their access to the platform immediately.
            </p>
          ) : (
            <p className="font-sans text-[12px] text-text-muted font-medium">
              Blocking will immediately prevent them from logging in and accessing the platform.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-[44px] rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary font-sans font-semibold text-[14px] transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 h-[44px] rounded-button border font-sans font-semibold text-[14px] transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-sm ${buttonBg}`}
          >
            {isLoading ? "Processing..." : `Yes, ${actionText}`}
          </button>
        </div>

      </div>
    </>
  );
}
