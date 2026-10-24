"use client";

import React, { useState } from "react";
import { OrderData } from "../../../services/admin.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import Link from "next/link";
import { toast } from "sonner";

interface AdminOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderData | null;
  onRefundClick?: (order: OrderData) => void;
}

export default function AdminOrderDetailModal({
  isOpen,
  onClose,
  order,
  onRefundClick,
}: AdminOrderDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, { resetKey: order?.id });

  if (!isOpen || !order) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
      case "Completed":
        return (
          <span className="px-2.5 py-0.5 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-[11px] shadow-sm">
            Paid
          </span>
        );
      case "Refunded":
        return (
          <span className="px-2.5 py-0.5 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[11px] shadow-sm">
            Refunded
          </span>
        );
      case "Failed":
        return (
          <span className="px-2.5 py-0.5 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[11px] shadow-sm">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-badge border border-border bg-bg text-text-muted font-sans font-semibold text-[11px] shadow-sm">
            {status}
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return isoString || "N/A";
    }
  };

  const ticketNumbers = order.ticketNumbers || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Draggable Modal Window */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[95vw] max-w-[640px] max-h-[90vh] bg-surface border border-border rounded-card ${
          isDragging ? "shadow-2xl ring-2 ring-primary/40 select-none" : "shadow-card"
        } z-50 animate-fadeIn flex flex-col font-sans select-none overflow-hidden`}
      >
        {/* Title Bar (Draggable) */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between px-6 py-4 border-b border-border bg-accent-bg/30 shrink-0 select-none cursor-grab active:cursor-grabbing transition-colors ${
            isDragging ? "bg-accent-bg/60" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-1 rounded text-text-muted opacity-70 shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-bold text-base text-text-primary">
                  Order Details
                </span>
                {getStatusBadge(order.status)}
                {isMoved && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetPosition();
                    }}
                    className="text-[11px] text-text-brand hover:underline font-semibold ml-1 cursor-pointer"
                  >
                    (Reset position)
                  </button>
                )}
              </div>
              <span className="font-mono text-xs text-text-muted">
                #{order.orderId || order.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isMoved && (
              <button
                type="button"
                onClick={resetPosition}
                title="Reset window to center"
                className="text-text-muted hover:text-text-brand p-1.5 rounded-button hover:bg-accent-bg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center text-xs"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface border border-border hover:bg-accent-bg text-text-muted hover:text-text-primary transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 max-h-[calc(90vh-140px)] custom-scrollbar">
          {/* Buyer Information Card */}
          <div className="bg-bg border border-border rounded-card p-4 flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Buyer Information
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0">
                <span className="font-sans font-bold text-[12px] text-text-brand">
                  {order.buyerInitials || "U"}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-bold text-sm text-text-primary truncate">
                  {order.buyerName}
                </span>
                {order.buyerEmail && (
                  <span className="font-sans text-xs text-text-muted truncate">
                    {order.buyerEmail}
                  </span>
                )}
                {order.buyerPhone && order.buyerPhone !== "N/A" && (
                  <span className="font-sans text-xs text-text-muted">
                    Tel: {order.buyerPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Competition Details */}
          <div className="bg-bg border border-border rounded-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Competition & Tickets
              </span>
              {order.competitionSlug && (
                <Link
                  href={`/live-raffles/${order.competitionSlug}`}
                  target="_blank"
                  className="text-xs font-semibold text-text-brand hover:underline flex items-center gap-1"
                >
                  <span>Public View</span>
                  <span>↗</span>
                </Link>
              )}
            </div>

            <span className="font-heading font-bold text-sm text-text-primary">
              {order.competition}
            </span>

            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <span className="text-xs text-text-muted">Tickets Purchased:</span>
              <span className="px-2 py-0.5 rounded bg-accent-bg border border-border-medium font-bold text-xs text-text-brand">
                {order.tickets} Ticket{order.tickets !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Ticket Numbers Allocated */}
            {ticketNumbers.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
                <span className="text-[11px] font-semibold text-text-muted">
                  Allocated Ticket Numbers:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-2 bg-surface border border-border rounded-button custom-scrollbar">
                  {ticketNumbers.map((num) => (
                    <span
                      key={num}
                      className="px-2 py-0.5 rounded bg-accent-bg border border-border-medium font-mono text-xs font-bold text-text-primary"
                    >
                      #{num}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Details Card */}
          <div className="bg-bg border border-border rounded-card p-4 flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Payment & Transaction
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col">
                <span className="text-text-muted">Total Amount</span>
                <span className="font-heading font-bold text-base text-text-brand mt-0.5">
                  £{order.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted">Payment Gateway</span>
                <span className="font-semibold text-text-primary mt-0.5">
                  {order.payment}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted">Order Date & Time</span>
                <span className="font-medium text-text-primary mt-0.5">
                  {formatDate(order.date)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted">Transaction ID</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs text-text-primary truncate max-w-[140px]" title={order.id}>
                    {order.id.slice(0, 12)}...
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.id, "Transaction ID")}
                    className="text-[10px] text-text-brand hover:underline font-semibold cursor-pointer shrink-0"
                  >
                    {copiedField === "Transaction ID" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {order.gatewayTransactionId && (
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted">Gateway Ref:</span>
                <span className="font-mono text-xs font-medium text-text-primary">
                  {order.gatewayTransactionId}
                </span>
              </div>
            )}

            {order.adminNotes && (
              <div className="pt-2 border-t border-border flex flex-col gap-1 text-xs">
                <span className="text-text-muted font-semibold">Admin Notes:</span>
                <span className="p-2 bg-surface rounded border border-border text-text-primary">
                  {order.adminNotes}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-accent-bg/20 flex items-center justify-between gap-3 shrink-0">
          <div>
            {order.status === "Paid" && onRefundClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRefundClick(order);
                }}
                className="px-4 py-2 rounded-button bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Process Refund
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary font-semibold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
