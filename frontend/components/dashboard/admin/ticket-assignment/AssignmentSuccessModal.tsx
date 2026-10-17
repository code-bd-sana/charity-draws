"use client";

import React from "react";
import { AssignTicketsResponse } from "../../../../services/admin.service";
import { CheckCircle2, Zap, Trophy, ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";

interface AssignmentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AssignTicketsResponse | null;
}

export default function AssignmentSuccessModal({
  isOpen,
  onClose,
  result,
}: AssignmentSuccessModalProps) {
  if (!isOpen || !result) return null;

  const hasInstantWins = result.instantWins && result.instantWins.length > 0;

  const handleCopyTransactionId = () => {
    const id = result.transaction.gatewayTransactionId || result.transaction.id;
    navigator.clipboard.writeText(id);
    toast.success("Transaction ID copied to clipboard!");
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[580px] max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-6 sm:p-8 select-none">
        {/* Animated Celebration Banner for Instant Wins */}
        {hasInstantWins && (
          <div className="relative overflow-hidden mb-6 p-5 rounded-card bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-500/40 text-center animate-pulse">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="w-6 h-6 text-amber-500 animate-bounce" />
              <span className="font-heading font-black text-lg sm:text-xl text-amber-600 tracking-wide">
                🎉 INSTANT WIN UNLOCKED!
              </span>
              <Zap className="w-6 h-6 text-amber-500 animate-bounce" />
            </div>
            <p className="font-sans text-xs sm:text-sm text-text-primary font-medium">
              The assigned ticket(s) automatically unlocked {result.instantWins.length} instant win prize(s)!
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {result.instantWins.map((win) => (
                <div
                  key={win.winnerId}
                  className="px-3 py-1.5 rounded-badge bg-amber-500/30 border border-amber-500/50 text-amber-800 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    Ticket #{win.ticketNumber}: {win.prizeName}
                    {win.rrpValue ? ` (£${win.rrpValue})` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standard Success Header */}
        {!hasInstantWins && (
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 mb-3 shadow-glow">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-text-primary">
              Tickets Successfully Assigned!
            </h2>
            <p className="font-sans text-sm text-text-muted mt-1">
              Allocation completed with financial crediting & audit log recorded.
            </p>
          </div>
        )}

        {/* Summary Card */}
        <div className="flex flex-col gap-3 p-4 rounded-card bg-bg border border-border text-sm font-sans mb-6">
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <span className="text-text-muted text-xs font-semibold">Recipient:</span>
            <span className="font-bold text-text-primary text-right">
              {result.recipient.name} ({result.recipient.email})
            </span>
          </div>
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <span className="text-text-muted text-xs font-semibold">Competition:</span>
            <span className="font-bold text-text-primary text-right">
              {result.competition.title}
            </span>
          </div>
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <span className="text-text-muted text-xs font-semibold">Total Financial Value:</span>
            <span className="font-heading font-bold text-emerald-600 text-base">
              £{result.totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <span className="text-text-muted text-xs font-semibold">Host Credited:</span>
            <span className="font-bold text-emerald-600">
              +£{result.hostCreditAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted text-xs font-semibold">Transaction Reference:</span>
            <div className="flex items-center gap-1.5 font-mono text-xs text-text-brand">
              <span>{result.transaction.gatewayTransactionId}</span>
              <button
                onClick={handleCopyTransactionId}
                className="hover:text-primary transition-colors cursor-pointer p-0.5"
                title="Copy reference"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Assigned Ticket Numbers */}
        <div className="flex flex-col gap-2 mb-6">
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-text-muted">
            Assigned Tickets ({result.ticketNumbers.length})
          </span>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 bg-surface border border-border rounded-card">
            {result.ticketNumbers.map((num) => {
              const isInstant = result.instantWins.some((w) => w.ticketNumber === num);
              return (
                <span
                  key={num}
                  className={`px-3 py-1 rounded-badge text-xs font-bold font-mono transition-all flex items-center gap-1 ${
                    isInstant
                      ? "bg-amber-500/20 border border-amber-500 text-amber-700 shadow-sm"
                      : "bg-accent-bg border border-border text-text-primary"
                  }`}
                >
                  {isInstant && <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  #{num}
                </span>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full h-[46px] rounded-button bg-primary hover:bg-primary-hover text-primary-text font-sans font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <span>Done & Back to Assignment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
