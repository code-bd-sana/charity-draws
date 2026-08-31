"use client";

import React, { useState } from "react";
import { Winner, winnerService } from "../../../services/winner.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { winnerKeys, raffleKeys } from "../../../hooks/queryKeys";

interface VerifyWinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: Winner | null;
}

export default function VerifyWinnerModal({ isOpen, onClose, winner }: VerifyWinnerModalProps) {
  const queryClient = useQueryClient();
  const [isPublishing, setIsPublishing] = useState(true);

  const mutation = useMutation({
    mutationFn: () => winnerService.verifyWinner(winner!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: winnerKeys.admin() });
      queryClient.invalidateQueries({ queryKey: winnerKeys.public() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.all });
      onClose();
    },
  });

  if (!isOpen || !winner) return null;

  const name = `${winner.user?.firstName || ''} ${winner.user?.lastName || ''}`.trim() || 'Unknown';

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[500px] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-8 select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <h2 className="font-heading font-bold text-[20px] text-text-primary">
            Verify & Publish Result
          </h2>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            disabled={mutation.isPending}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Winner Info Box */}
        <div className="w-full bg-bg border border-border rounded-button p-5 mb-6 flex flex-col gap-1">
          <span className="font-sans text-[12px] text-text-muted font-semibold">Winner</span>
          <span className="font-heading font-bold text-[16px] text-text-primary">
            {name} — <span className="text-text-brand">Ticket #{winner.ticket?.ticketNumber || 'N/A'}</span>
          </span>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between mb-8 bg-bg p-4 border border-border rounded-button">
          <span className="font-sans font-semibold text-[13px] text-text-primary">Publish to Public Winners Page</span>
          {/* Custom Toggle Switch */}
          <div 
            onClick={() => setIsPublishing(!isPublishing)}
            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors flex items-center px-0.5 ${isPublishing ? 'bg-primary' : 'bg-border-medium'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute shadow-sm transform transition-transform ${isPublishing ? 'right-0.5' : 'left-0.5'}`} />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full h-[48px] rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[14px] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
        >
          {mutation.isPending ? 'Verifying...' : 'Confirm & Publish'}
        </button>

      </div>
    </>
  );
}
