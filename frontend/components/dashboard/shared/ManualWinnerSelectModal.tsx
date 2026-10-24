"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { raffleService } from "../../../services/raffle.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";

export interface SoldTicket {
  id: string;
  ticketNumber: number;
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  createdAt: string;
}

interface ManualWinnerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffle: {
    id: string;
    title: string;
    totalTickets: number;
    ticketsSold?: number;
    isAutoDraw?: boolean;
    slug?: string;
  };
  onSuccess?: () => void;
  isAdmin?: boolean;
}

export default function ManualWinnerSelectModal({
  isOpen,
  onClose,
  raffle,
  onSuccess,
  isAdmin = true,
}: ManualWinnerSelectModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "random">("manual");
  const [ticketInput, setTicketInput] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<SoldTicket | null>(null);

  const [soldTickets, setSoldTickets] = useState<SoldTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketSearch, setTicketSearch] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [winnerResult, setWinnerResult] = useState<any | null>(null);

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, { resetKey: raffle?.id });

  useEffect(() => {
    if (isOpen && raffle.id) {
      fetchSoldTickets();
    }
  }, [isOpen, raffle.id]);

  const fetchSoldTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const data = await raffleService.getSoldTickets(raffle.id);
      setSoldTickets(data || []);
    } catch (e) {
      console.error("Failed to load sold tickets:", e);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  if (!isOpen) return null;

  const filteredTickets = soldTickets.filter((t) => {
    const query = ticketSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      t.ticketNumber.toString().includes(query) ||
      t.userName.toLowerCase().includes(query) ||
      t.userEmail.toLowerCase().includes(query)
    );
  });

  const handleSelectTicketFromList = (t: SoldTicket) => {
    setSelectedTicket(t);
    setTicketInput(t.ticketNumber.toString());
    setErrorMessage(null);
  };

  const handleDrawWinner = async (winningTicketNum?: number) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setWinnerResult(null);

    try {
      const data = await raffleService.adminDrawWinner(raffle.id, winningTicketNum);
      setWinnerResult(data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err.message || "An error occurred while drawing winner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(ticketInput.trim(), 10);
    if (isNaN(num) || num <= 0) {
      setErrorMessage("Please enter or select a valid ticket number.");
      return;
    }
    handleDrawWinner(num);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] select-none">
      {/* Dark Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Draggable Modal Card */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[95vw] sm:max-w-[540px] md:max-w-[620px] bg-surface border border-border rounded-[20px] p-5 sm:p-7 ${
          isDragging ? "shadow-2xl ring-2 ring-primary/50 select-none" : "shadow-card"
        } flex flex-col gap-5 z-10 max-h-[85vh] overflow-y-auto custom-scrollbar select-none animate-fadeIn`}
      >
        {/* Header Row - Draggable Bar */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className="flex items-start justify-between border-b border-divider pb-4 shrink-0 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-start gap-3 pr-2">
            <div className="p-1 rounded text-text-brand opacity-70 shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h3 className="font-heading font-bold text-[18px] sm:text-[20px] text-text-primary">
                  Winner Selection
                </h3>
              </div>
              <p className="font-sans text-[12px] text-text-muted">
                {raffle.title}
              </p>
              {isMoved && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetPosition();
                  }}
                  className="text-[11px] text-text-brand hover:underline font-semibold cursor-pointer text-left"
                >
                  (Reset position to center)
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isMoved && (
              <button
                type="button"
                onClick={resetPosition}
                title="Reset window to center"
                className="p-1.5 rounded-button text-text-muted hover:text-text-primary hover:bg-accent-bg/40 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer text-xs"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-button text-text-muted hover:text-text-primary hover:bg-accent-bg/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Competition Info Badges */}
        <div className="grid grid-cols-2 gap-3 bg-elevated/70 border border-border p-3.5 rounded-[12px] text-xs">
          <div className="flex flex-col">
            <span className="text-text-muted text-[10px] uppercase font-sans">Draw Mode</span>
            <span className="font-semibold text-text-brand mt-0.5">
              {raffle.isAutoDraw ? "Automatic Draw" : "Manual Winner Selection"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-text-muted text-[10px] uppercase font-sans">Total Sold Tickets</span>
            <span className="font-semibold text-text-primary mt-0.5">
              {soldTickets.length || raffle.ticketsSold || 0} / {raffle.totalTickets}
            </span>
          </div>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-[10px] text-xs font-sans text-red-700 flex items-start gap-2">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Winner Result Success Screen */}
        {winnerResult ? (
          <div className="flex flex-col gap-4 bg-accent-bg/50 border border-border rounded-[16px] p-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-3xl mx-auto font-bold shadow-glow">
              🎉
            </div>
            <div className="flex flex-col">
              <h4 className="font-heading font-bold text-[20px] text-text-primary">
                Main Winner Declared!
              </h4>
              <p className="font-sans text-[13px] text-text-brand mt-1 font-semibold">
                Winning Ticket #{winnerResult.ticket?.ticketNumber || ticketInput}
              </p>
            </div>

            <div className="bg-surface border border-border p-4 rounded-[12px] text-left flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-divider">
                <span className="text-text-muted">Winner Name:</span>
                <span className="font-bold text-text-primary text-sm">
                  {winnerResult.user?.firstName
                    ? `${winnerResult.user.firstName} ${winnerResult.user.lastName || ''}`.trim()
                    : "Winner"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-divider">
                <span className="text-text-muted">Winner Email:</span>
                <span className="font-mono text-text-brand font-semibold">
                  {winnerResult.user?.email || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Prize Title:</span>
                <span className="font-semibold text-text-primary">
                  {winnerResult.prizeName || raffle.title}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-heading font-semibold text-sm rounded-[10px] transition-colors mt-2 shadow-glow cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <>
            {/* Draw Mode Tabs */}
            <div className="flex items-center gap-2 p-1 bg-elevated/70 border border-border rounded-[10px]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("manual");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer ${
                  activeTab === "manual"
                    ? "bg-surface border border-border text-text-brand shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                🔍 Search Buyer & Ticket Number
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("random");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer ${
                  activeTab === "random"
                    ? "bg-surface border border-border text-text-brand shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                🎲 Certified Random Draw
              </button>
            </div>

            {/* Tab 1: Manual Search & Input */}
            {activeTab === "manual" && (
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                {/* Search Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-medium text-text-primary">
                    Search Sold Tickets (by Ticket #, Name, or Email)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type ticket number, buyer name, or email to search..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-bg border border-border rounded-[10px] font-sans text-xs text-text-primary placeholder:text-text-muted focus:border-primary outline-none transition-colors"
                    />
                    <svg className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                </div>

                {/* Sold Tickets Search Results Dropdown List */}
                <div className="flex flex-col gap-1 bg-bg border border-border rounded-[12px] p-2 max-h-[190px] overflow-y-auto custom-scrollbar">
                  {isLoadingTickets ? (
                    <div className="py-6 text-center text-xs text-text-muted">Loading sold tickets list...</div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="py-6 text-center text-xs text-text-muted">
                      {soldTickets.length === 0 ? "No tickets sold yet in this competition." : "No matching tickets found for your search."}
                    </div>
                  ) : (
                    filteredTickets.map((t) => {
                      const isSelected = ticketInput === t.ticketNumber.toString();
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTicketFromList(t)}
                          className={`flex items-center justify-between p-2.5 rounded-[8px] text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-accent-bg border border-primary text-text-brand"
                              : "bg-surface border border-transparent hover:border-border text-text-primary"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-heading font-bold text-xs bg-accent-bg border border-border text-text-brand px-2 py-1 rounded-[6px]">
                              Ticket #{t.ticketNumber}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-sans font-medium text-xs text-text-primary">{t.userName}</span>
                              <span className="font-sans text-[11px] text-text-muted">{t.userEmail}</span>
                            </div>
                          </div>

                          <span className={`text-[11px] font-semibold ${isSelected ? "text-text-brand" : "text-text-muted"}`}>
                            {isSelected ? "Selected ✓" : "Select"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Direct Number Input */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-divider">
                  <label className="font-sans text-xs font-medium text-text-primary">
                    Selected Winning Ticket Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={raffle.totalTickets}
                    placeholder="e.g. 42"
                    value={ticketInput}
                    onChange={(e) => {
                      setTicketInput(e.target.value);
                      setSelectedTicket(null);
                    }}
                    className="h-11 px-4 bg-bg border border-border rounded-[10px] font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-primary outline-none transition-colors"
                    required
                  />
                  {selectedTicket && (
                    <span className="font-sans text-[11px] text-text-brand flex items-center gap-1 mt-0.5">
                      ✓ Selected ticket #{selectedTicket.ticketNumber} belongs to <strong>{selectedTicket.userName}</strong> ({selectedTicket.userEmail})
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !ticketInput}
                  className="w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-semibold text-sm rounded-[10px] transition-all flex items-center justify-center gap-2 shadow-glow mt-1 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse font-bold">Validating & Setting Winner...</span>
                  ) : (
                    <span>Confirm & Declare Winner</span>
                  )}
                </button>
              </form>
            )}

            {/* Tab 2: Random Draw */}
            {activeTab === "random" && (
              <div className="flex flex-col gap-4 py-2">
                <p className="font-sans text-xs text-text-muted leading-relaxed bg-elevated/70 border border-border p-4 rounded-[12px]">
                  Clicking below will use the certified randomizer to instantly pick a winning ticket from all <strong>{soldTickets.length || raffle.ticketsSold || 0}</strong> sold tickets in this competition.
                </p>

                <button
                  type="button"
                  onClick={() => handleDrawWinner()}
                  disabled={isSubmitting}
                  className="w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-semibold text-sm rounded-[10px] transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse font-bold">Running Certified Random Draw...</span>
                  ) : (
                    <span>🎲 Draw Random Winner Now</span>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}
