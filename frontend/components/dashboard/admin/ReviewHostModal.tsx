"use client";

import React from "react";

export interface HostApplicationData {
  id: string;
  brandName: string;
  email: string;
  bio: string;
  contact: string;
  payoutMethod: string;
  social: string;
  isVerified?: boolean;
}

interface ReviewHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HostApplicationData | null;
  onApprove?: (hostId: string) => void;
  isApproveLoading?: boolean;
  onReject?: (hostId: string) => void;
  isRejectLoading?: boolean;
}

export default function ReviewHostModal({ 
  isOpen, 
  onClose, 
  data, 
  onApprove, 
  isApproveLoading,
  onReject,
  isRejectLoading
}: ReviewHostModalProps) {
  if (!isOpen || !data) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:max-w-[540px] max-h-[85vh] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-6 sm:p-7 select-none overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
          <h2 className="font-heading font-bold text-[18px] sm:text-[20px] text-text-primary">
            Host Details
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

        {/* Content Details (Scrollable Body) */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 font-sans pr-1">
          
          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <span className="text-[13px] font-semibold text-text-muted">Brand Name</span>
            <span className="text-[13px] font-bold text-text-primary">{data.brandName}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <span className="text-[13px] font-semibold text-text-muted">Email</span>
            <span className="text-[13px] font-bold text-text-brand">{data.email}</span>
          </div>

          <div className="flex items-start justify-between pb-2 border-b border-divider">
            <span className="text-[13px] font-semibold text-text-muted">Bio</span>
            <span className="text-[13px] text-text-primary font-medium text-right max-w-[280px]">{data.bio}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <span className="text-[13px] font-semibold text-text-muted">Contact</span>
            <span className="text-[13px] text-text-primary font-medium">{data.contact}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <span className="text-[13px] font-semibold text-text-muted">Payout Method</span>
            <span className="text-[13px] text-text-primary font-medium">{data.payoutMethod}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-text-muted">Social</span>
            <span className="text-[13px] text-text-primary font-medium">{data.social}</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-divider shrink-0">
          {!data.isVerified && onApprove && (
            <button 
              onClick={() => onApprove(data.id)}
              disabled={isApproveLoading || isRejectLoading}
              className="w-full min-h-[44px] h-[44px] rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isApproveLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Approve Host"
              )}
            </button>
          )}
          {!data.isVerified && onReject && (
            <button 
              onClick={() => onReject(data.id)}
              disabled={isApproveLoading || isRejectLoading}
              className="w-full min-h-[44px] h-[44px] rounded-button bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white text-red-700 font-sans font-semibold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isRejectLoading ? (
                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                "Reject Host"
              )}
            </button>
          )}
          <button 
            onClick={onClose}
            className="w-full min-h-[44px] h-[44px] rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary font-sans font-semibold text-[14px] transition-all cursor-pointer shadow-sm flex items-center justify-center"
          >
            Close
          </button>
        </div>

      </div>
    </>
  );
}
