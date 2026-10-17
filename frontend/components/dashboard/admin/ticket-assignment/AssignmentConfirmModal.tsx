"use client";

import React from "react";
import {
  AssignmentCompetitionDetails,
  AssignmentSearchUser,
} from "../../../../services/admin.service";
import { ShieldCheck, Zap, AlertTriangle, X } from "lucide-react";

interface AssignmentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  competition: AssignmentCompetitionDetails | null;
  recipient: AssignmentSearchUser | null;
  mode: "specific" | "random";
  selectedNumbers: number[];
  randomQuantity: number;
  adminNotes: string;
}

export default function AssignmentConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  competition,
  recipient,
  mode,
  selectedNumbers,
  randomQuantity,
  adminNotes,
}: AssignmentConfirmModalProps) {
  if (!isOpen || !competition || !recipient) return null;

  const count = mode === "specific" ? selectedNumbers.length : randomQuantity;
  const unitPrice = competition.pricePerTicket;
  const totalValue = count * unitPrice;

  // Identify any instant wins triggered by the selected specific numbers
  const instantWinsTriggered =
    mode === "specific"
      ? competition.instantWins.filter(
          (iw) => !iw.isClaimed && selectedNumbers.includes(iw.ticketNumber)
        )
      : [];

  const hostName =
    competition.host?.businessName ||
    competition.host?.user?.name ||
    "Host Profile";

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[560px] max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-6 sm:p-8 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-[18px] sm:text-[20px] text-text-primary">
                Confirm Manual Ticket Assignment
              </h2>
              <p className="font-sans text-[12px] text-text-muted">
                Review financial and ticket allocation details before executing
              </p>
            </div>
          </div>
          <button
            onClick={!isLoading ? onClose : undefined}
            disabled={isLoading}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-5 py-5 text-sm font-sans">
          {/* Instant Win Notice Banner (if any) */}
          {instantWinsTriggered.length > 0 && (
            <div className="p-4 rounded-card bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-heading font-bold text-amber-600 text-[13px]">
                  Instant Win Alert!
                </span>
                <p className="text-text-secondary text-[12px] leading-relaxed">
                  The selected ticket numbers include{" "}
                  <strong>{instantWinsTriggered.length} instant win(s)</strong>:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {instantWinsTriggered.map((iw) => (
                    <span
                      key={iw.id}
                      className="px-2 py-0.5 rounded-badge bg-amber-500/20 text-amber-700 font-bold text-[11px]"
                    >
                      #{iw.ticketNumber}: {iw.prizeName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Recipient Box */}
            <div className="p-3.5 rounded-card bg-bg border border-border flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Recipient User
              </span>
              <div className="flex items-center gap-2.5 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-accent-bg border border-border flex items-center justify-center font-bold text-xs text-text-brand shrink-0 overflow-hidden">
                  {recipient.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={recipient.avatarUrl}
                      alt={recipient.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    recipient.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-text-primary text-[13px] truncate">
                    {recipient.name}
                  </span>
                  <span className="text-text-muted text-[11px] truncate">
                    {recipient.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Competition Box */}
            <div className="p-3.5 rounded-card bg-bg border border-border flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Competition
              </span>
              <div className="flex items-center gap-2.5 mt-0.5">
                <div className="w-8 h-8 rounded-lg bg-accent-bg border border-border flex items-center justify-center shrink-0 overflow-hidden">
                  {competition.mainImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={competition.mainImage}
                      alt={competition.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs">🎟️</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-text-primary text-[13px] truncate">
                    {competition.title}
                  </span>
                  <span className="text-text-muted text-[11px] truncate">
                    Host: {hostName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation & Financial Breakdown */}
          <div className="p-4 rounded-card bg-accent-bg/40 border border-border flex flex-col gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Accounting & Financial Impact
            </span>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-text-secondary">Quantity & Mode:</span>
              <span className="font-bold text-text-primary">
                {count} Tickets ({mode === "specific" ? "Specific Selection" : "Random Available Pool"})
              </span>
            </div>
            {mode === "specific" && (
              <div className="flex justify-between items-start text-[13px]">
                <span className="text-text-secondary shrink-0">Assigned Numbers:</span>
                <span className="font-mono font-bold text-text-brand text-right max-w-[280px] break-words">
                  {selectedNumbers.slice(0, 15).map((n) => `#${n}`).join(", ")}
                  {selectedNumbers.length > 15 ? ` (+${selectedNumbers.length - 15} more)` : ""}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-text-secondary">Unit Ticket Price:</span>
              <span className="font-bold text-text-primary">£{unitPrice.toFixed(2)}</span>
            </div>
            <div className="h-px bg-divider my-1" />
            <div className="flex justify-between items-center text-[15px]">
              <span className="font-heading font-bold text-text-primary">Total Value Credited:</span>
              <span className="font-heading font-bold text-text-brand text-[18px]">
                £{totalValue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Host Wallet Statement Notice */}
          <div className="p-3.5 rounded-card bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[12px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Host Wallet Balance:</strong> £{totalValue.toFixed(2)} will be immediately credited to{" "}
              <strong>{hostName}</strong>&apos;s account balance.
            </span>
          </div>

          {/* Admin Notes Display */}
          {adminNotes && (
            <div className="p-3.5 rounded-card bg-bg border border-border flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Audit / Allocation Reason:
              </span>
              <p className="text-[13px] text-text-primary italic">&quot;{adminNotes}&quot;</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-[44px] rounded-button bg-surface border border-border hover:bg-accent-bg text-text-secondary font-semibold text-[13px] transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-[44px] rounded-button bg-primary hover:bg-primary-hover text-primary-text font-bold text-[13px] transition-all flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-sm gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Processing Assignment...</span>
              </>
            ) : (
              <span>Confirm & Issue Tickets</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
