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
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[560px] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-8 select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <h2 className="font-heading font-bold text-[20px] text-text-primary">
            Host Details
          </h2>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Details */}
        <div className="flex flex-col gap-5 font-sans">
          
          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <span className="text-[14px] font-semibold text-text-muted">Brand Name</span>
            <span className="text-[14px] font-bold text-text-primary">{data.brandName}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <span className="text-[14px] font-semibold text-text-muted">Email</span>
            <span className="text-[14px] font-bold text-text-brand">{data.email}</span>
          </div>

          <div className="flex items-start justify-between pb-2 border-b border-divider">
            <span className="text-[14px] font-semibold text-text-muted">Bio</span>
            <span className="text-[14px] text-text-primary font-medium text-right max-w-[300px]">{data.bio}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <span className="text-[14px] font-semibold text-text-muted">Contact</span>
            <span className="text-[14px] text-text-primary font-medium">{data.contact}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <span className="text-[14px] font-semibold text-text-muted">Payout Method</span>
            <span className="text-[14px] text-text-primary font-medium">{data.payoutMethod}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-text-muted">Social</span>
            <span className="text-[14px] text-text-primary font-medium">{data.social}</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 pt-4 border-t border-divider">
          {!data.isVerified && onApprove && (
            <button 
              onClick={() => onApprove(data.id)}
              disabled={isApproveLoading || isRejectLoading}
              className="w-full h-[48px] rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
              className="w-full h-[48px] rounded-button bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white text-red-700 font-sans font-semibold text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
            className="w-full h-[48px] rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary font-sans font-semibold text-[15px] transition-all cursor-pointer shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </>
  );
}
