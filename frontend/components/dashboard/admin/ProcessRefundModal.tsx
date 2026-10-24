"use client";

import React, { useState } from "react";
import { useProcessRefundMutation } from "../../../hooks/useAdminHooks";
import { OrderData } from "../../../services/admin.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";

export type { OrderData };

interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderData | null;
}

export default function ProcessRefundModal({ isOpen, onClose, order }: ProcessRefundModalProps) {
  const [reason, setReason] = useState("");
  const { mutate: processRefund, isPending } = useProcessRefundMutation();

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, { resetKey: order?.id });

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
      
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[90%] max-w-[500px] bg-surface border border-border rounded-card ${
          isDragging ? "shadow-2xl ring-2 ring-primary/40 select-none" : "shadow-card"
        } z-50 animate-fadeIn flex flex-col p-6 sm:p-8 select-none`}
      >
        {/* Header - Windows-style Draggable Title Bar */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className="flex items-center justify-between mb-6 cursor-grab active:cursor-grabbing select-none -mx-2 px-2 py-1 rounded"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-text-muted opacity-70" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
            <h2 className="font-heading font-bold text-[20px] text-text-primary">
              Process Refund
            </h2>
            {isMoved && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetPosition();
                }}
                className="text-[11px] text-text-brand hover:underline font-semibold ml-1 cursor-pointer"
              >
                (Reset)
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isMoved && (
              <button
                type="button"
                onClick={resetPosition}
                title="Reset window to center"
                className="p-1 rounded text-text-muted hover:text-text-brand hover:bg-accent-bg cursor-pointer text-xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}
            <button 
              onClick={onClose}
              disabled={isPending}
              className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer p-1 rounded hover:bg-accent-bg"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Order Info Box */}
        <div className="w-full bg-bg border border-border rounded-button p-4 sm:p-5 mb-6 flex flex-col gap-1">
          <span className="font-sans text-[12px] text-text-muted font-semibold">Order #{order.orderId}</span>
          <span className="font-heading font-bold text-[16px] text-text-primary">
            {order.buyerName} — <span className="text-text-brand">£{order.amount.toFixed(2)}</span>
          </span>
          <span className="font-sans text-xs text-text-muted mt-1 truncate">
            Competition: {order.competition}
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
