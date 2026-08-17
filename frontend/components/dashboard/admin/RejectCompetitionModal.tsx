"use client";

import React from "react";

interface RejectCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitionData: { id: string; title: string } | null;
}

export default function RejectCompetitionModal({ isOpen, onClose, competitionData }: RejectCompetitionModalProps) {
  if (!isOpen || !competitionData) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[560px] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-8 select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-[20px] text-text-primary">
            Reason for Rejection
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

        {/* Subtitle */}
        <div className="flex items-center gap-1.5 mb-6 bg-bg p-3 border border-border rounded-button">
          <span className="font-sans text-[13px] text-text-muted font-medium">Rejecting:</span>
          <span className="font-sans font-bold text-[13px] text-text-primary">{competitionData.title}</span>
        </div>

        {/* Textarea */}
        <div className="w-full mb-6">
          <textarea 
            rows={5}
            placeholder="Describe the issue and what the host should change before resubmitting..."
            className="w-full bg-bg border border-border rounded-button p-4 text-text-primary font-sans text-[13px] placeholder:text-text-muted outline-none focus:border-primary resize-none transition-colors"
          />
        </div>

        {/* Button */}
        <button 
          onClick={onClose}
          className="w-full h-[48px] rounded-button bg-red-600 hover:bg-red-700 text-white font-sans font-semibold text-[14px] transition-all flex items-center justify-center cursor-pointer shadow-sm"
        >
          Send Feedback & Request Changes
        </button>

      </div>
    </>
  );
}
