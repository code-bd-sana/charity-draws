"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { cn } from "../../../lib/utils";

export interface InstantWinItem {
  id: string;
  ticketId: string;
  prizeName: string;
  ticketNumber?: number;
}

export interface TicketItem {
  id: string;
  ticketNumber: number;
}

export interface TicketPurchaseSuccessData {
  raffleTitle: string;
  tickets: TicketItem[];
  instantWins: InstantWinItem[];
  totalAmount?: number;
}

interface TicketPurchaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TicketPurchaseSuccessData | null;
}

export default function TicketPurchaseSuccessModal({
  isOpen,
  onClose,
  data,
}: TicketPurchaseSuccessModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !data || !mounted) return null;

  const { raffleTitle, tickets, instantWins } = data;
  const instantWinTicketIds = new Set(instantWins.map((iw) => iw.ticketId));
  const instantWinTicketNumbers = new Set(
    instantWins.map((iw) => iw.ticketNumber).filter((num): num is number => num !== undefined)
  );

  const handleGoToDashboard = () => {
    onClose();
    router.push("/dashboard/user/tickets");
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-white border border-[#E9D5FF] rounded-[24px] w-[95vw] sm:max-w-[560px] max-h-[85vh] overflow-hidden shadow-[0_20px_50px_rgba(113,49,200,0.18)] animate-in zoom-in-95 duration-300 flex flex-col z-[10000] select-none">
        
        {/* Glow Header Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-[#7131C8] via-[#8B5CF6] to-[#A855F7] shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-7 border-b border-[#F0E6FF] bg-[#FAF5FF] flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 pr-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F3E8FF] border border-[#D8B4FE] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(113,49,200,0.15)]">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#7131C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg sm:text-2xl text-[#2E0B57] leading-tight">
                Tickets Allocated!
              </h2>
              <p className="font-sans text-xs text-[#7131C8] mt-0.5">
                {tickets.length} ticket(s) issued for <span className="text-[#2E0B57] font-semibold">{raffleTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#2E0B57] p-1.5 rounded-lg hover:bg-[#F3E8FF] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Scroll Area */}
        <div className="p-5 sm:p-7 space-y-5 sm:space-y-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
          
          {/* Instant Win Banner if user won any instant prize */}
          {instantWins.length > 0 && (
            <div className="bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7] to-[#FFFBEB] border border-[#F59E0B]/50 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(245,158,11,0.15)] animate-in slide-in-from-top duration-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-[#D97706]">
                    INSTANT WIN PRIZE CLAIMED!
                  </h3>
                  <p className="font-sans text-xs text-[#92400E] mt-0.5">
                    Congratulations! You instantly won {instantWins.length} prize(s) with your purchase!
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                {instantWins.map((iw, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-[#F59E0B]/30 p-3 rounded-xl gap-2 sm:gap-0 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-heading font-bold text-xs text-[#D97706] bg-[#FEF3C7] border border-[#F59E0B]/30 px-2 py-0.5 rounded-md">
                        Ticket #{iw.ticketNumber || "WIN"}
                      </span>
                      <span className="font-sans font-semibold text-xs text-[#1F2937]">
                        {iw.prizeName}
                      </span>
                    </div>
                    <span className="text-[10px] font-sans font-bold text-[#166534] bg-[#DCFCE7] border border-[#86EFAC] px-2 py-0.5 rounded-full self-start sm:self-auto">
                      Instant Win Claimed
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3.5 pt-3 border-t border-[#F59E0B]/20 flex items-center gap-2 text-[11px] text-[#B45309]">
                <span>ℹ️</span>
                <span>Note: Your ticket(s) also remain 100% entered for the Main Competition Draw when the timer closes!</span>
              </div>
            </div>
          )}

          {/* Ticket Numbers Grid Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#7131C8]">
                Your Instant Ticket Numbers ({tickets.length})
              </h3>
              <span className="font-sans text-[11px] text-[#6B7280]">
                Live in competition database
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[160px] overflow-y-auto p-1 custom-scrollbar">
              {tickets.map((t) => {
                const isWinningTicket =
                  instantWinTicketIds.has(t.id) ||
                  (t.ticketNumber && instantWinTicketNumbers.has(t.ticketNumber));

                return (
                  <div
                    key={t.id}
                    className={cn(
                      "py-2.5 px-3 rounded-xl font-heading font-bold text-xs sm:text-sm text-center border transition-all flex items-center justify-center gap-1 min-h-[40px]",
                      isWinningTicket
                        ? "bg-[#FEF3C7] border-[#F59E0B] text-[#D97706] shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-bounce"
                        : "bg-[#FAF5FF] border-[#E9D5FF] text-[#7131C8] hover:border-[#7131C8]"
                    )}
                  >
                    {isWinningTicket && <span>🏆</span>}
                    <span>#{t.ticketNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dashboard Notice Box */}
          <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] border border-[#D8B4FE] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#7131C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
            </div>
            <p className="font-sans text-xs text-[#4B5563] leading-normal">
              Want to see all your active and past tickets anytime? Access your personal ticket ledger in your <strong className="text-[#2E0B57]">Dashboard &gt; My Tickets</strong> page.
            </p>
          </div>

        </div>

        {/* Pinned Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#F0E6FF] bg-[#FAF5FF] flex flex-col sm:flex-row gap-3 items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-3 rounded-xl border border-[#E9D5FF] bg-white hover:bg-[#F3E8FF] text-[#7131C8] font-sans font-semibold text-xs transition-colors flex items-center justify-center cursor-pointer shadow-sm"
          >
            Keep Browsing Competitions
          </button>

          <button
            type="button"
            onClick={handleGoToDashboard}
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl bg-gradient-to-r from-[#7131C8] to-[#8B5CF6] hover:from-[#5B20B5] hover:to-[#7C3AED] text-white font-sans font-bold text-xs shadow-[0_4px_15px_rgba(113,49,200,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            View Tickets in Dashboard
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
