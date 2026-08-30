"use client";

import React, { useState } from "react";
import { useProcessRefundMutation } from "../../../hooks/useAdminHooks";
import { OrderData } from "../../../services/admin.service";

export type { OrderData };

interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderData | null;
}

export default function ProcessRefundModal({ isOpen, onClose, order }: ProcessRefundModalProps) {
  const [reason, setReason] = useState("");
  const { mutate: processRefund, isPending } = useProcessRefundMutation();

  if (!isOpen || !order) return null;

  const handleRefund = () => {
    processRefund(
      { transactionId: order.id, reason },
      {
        onSuccess: () => {
          setReason("");
          onClose();
        },
      }
    );
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[500px] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-8 select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-[20px] text-text-primary">
            Process Refund
          </h2>
          <button 
            onClick={onClose}
            disabled={isPending}
            className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Order Info Box */}
        <div className="w-full bg-bg border border-border rounded-button p-5 mb-6 flex flex-col gap-1">
          <span className="font-sans text-[12px] text-text-muted font-semibold">Order #{order.orderId}</span>
          <span className="font-heading font-bold text-[16px] text-text-primary">
            {order.buyerName} — <span className="text-text-brand">£{order.amount.toFixed(2)}</span>
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {/* Refund Amount Input */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[12px] font-semibold text-text-muted">Refund Amount (Fixed)</label>
            <input 
              type="text" 
              readOnly
              value={`£${order.amount.toFixed(2)}`}
              className="h-[44px] bg-bg border border-border rounded-button px-4 text-text-brand font-bold text-[14px] outline-none cursor-not-allowed font-sans"
            />
          </div>

          {/* Reason Input */}
          <div className="flex flex-col gap-2 mb-2">
            <label className="font-sans text-[12px] font-semibold text-text-muted">Reason (Optional)</label>
            <input 
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
              placeholder="e.g. Customer requested cancellation"
              className="h-[44px] bg-bg border border-border rounded-button px-4 text-text-primary font-sans text-[13px] outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleRefund}
            disabled={isPending}
            className="w-full h-[48px] rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[14px] transition-all flex items-center justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
          >
            {isPending ? "Processing..." : "Process Refund"}
          </button>
        </div>

      </div>
    </>
  );
}
