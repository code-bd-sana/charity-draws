"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { raffleService } from "../../../services/raffle.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { useDraggableModal } from "../../../hooks/useDraggableModal";

export interface TicketDetail {
  id: string;
  ticketNumber: number;
  raffleId?: string;
  raffleTitle?: string;
  raffleCategory?: string;
  pricePerTicket?: number;
  buyerName?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userLocation?: string;
  transactionId?: string;
  gatewayTransactionId?: string;
  paymentGateway?: string;
  paymentStatus?: string;
  winStatus?: string;
  createdAt: string;
}

interface ViewSoldTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffle: {
    id: string;
    title: string;
    totalTickets: number;
    ticketsSold?: number;
    pricePerTicket?: number;
    category?: string;
    host?: any;
  } | null;
}

export default function ViewSoldTicketsModal({
  isOpen,
  onClose,
  raffle,
}: ViewSoldTicketsModalProps) {
  const [tickets, setTickets] = useState<TicketDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, { resetKey: raffle?.id });

  useEffect(() => {
    if (isOpen && raffle?.id) {
      loadTickets();
    }
  }, [isOpen, raffle?.id]);

  const loadTickets = async () => {
    if (!raffle?.id) return;
    setIsLoading(true);
    try {
      const data = await raffleService.getSoldTickets(raffle.id);
      setTickets(data || []);
    } catch (err: any) {
      console.error("Failed to load sold tickets:", err);
      toast.error(err?.response?.data?.message || "Failed to load sold tickets list");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !raffle) return null;

  const filteredTickets = tickets.filter((t) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const ticketNumStr = `#${t.ticketNumber}`.toLowerCase();
    const name = (t.buyerName || t.userName || "").toLowerCase();
    const email = (t.userEmail || "").toLowerCase();
    const tx = (t.transactionId || "").toLowerCase();
    return (
      ticketNumStr.includes(q) ||
      t.ticketNumber.toString().includes(q) ||
      name.includes(q) ||
      email.includes(q) ||
      tx.includes(q)
    );
  });

  const handleExportCSV = () => {
    if (tickets.length === 0) {
      toast.info("No tickets to export.");
      return;
    }

    const headers = [
      "Ticket Number",
      "Competition Title",
      "Category",
      "Buyer / Client Name",
      "Buyer Email",
      "Buyer Phone",
      "Buyer Location",
      "Ticket Price (£)",
      "Win Status",
      "Transaction ID",
      "Gateway Transaction ID",
      "Payment Gateway",
      "Payment Status",
      "Purchase Date & Time"
    ];

    const rows = tickets.map((t) => {
      const ticketNum = `#${t.ticketNumber}`;
      const raffleTitle = t.raffleTitle || raffle.title || "N/A";
      const category = t.raffleCategory || raffle.category || "N/A";
      const buyerName = t.buyerName || t.userName || "N/A";
      const buyerEmail = t.userEmail || "N/A";
      const phone = t.userPhone || "N/A";
      const location = t.userLocation || "N/A";
      const price = Number(t.pricePerTicket || raffle.pricePerTicket || 0).toFixed(2);
      const winStatus = t.winStatus || "Regular Entry";
      const txId = t.transactionId || "N/A";
      const gatewayTxId = t.gatewayTransactionId || "N/A";
      const gateway = t.paymentGateway || "N/A";
      const payStatus = t.paymentStatus || "COMPLETED";
      const purchaseDate = t.createdAt ? format(new Date(t.createdAt), "dd MMM yyyy HH:mm:ss") : "N/A";

      return [
        ticketNum,
        raffleTitle,
        category,
        buyerName,
        buyerEmail,
        phone,
        location,
        price,
        winStatus,
        txId,
        gatewayTxId,
        gateway,
        payStatus,
        purchaseDate
      ];
    });

    const csvContent = [
      headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const safeTitle = String(raffle.title).toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    link.setAttribute("download", `tickets_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`);

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${tickets.length} tickets successfully!`);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn transition-opacity"
        onClick={onClose}
      />

      {/* Draggable Modal Card */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[95vw] sm:max-w-[540px] md:max-w-4xl max-h-[85vh] bg-surface border border-border rounded-[20px] ${
          isDragging ? "shadow-2xl ring-2 ring-primary/50 select-none" : "shadow-card"
        } flex flex-col overflow-hidden text-text-primary select-none z-10 animate-fadeIn`}
      >
        {/* Header - Draggable Bar */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-divider bg-elevated/80 shrink-0 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="p-1 rounded text-text-brand opacity-70 shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold bg-accent-bg border border-border text-text-brand">
                  🎟️ Ticket Details
                </span>
                <h2 className="font-heading font-bold text-base sm:text-lg text-text-primary truncate max-w-[240px] sm:max-w-[400px]">
                  {raffle.title}
                </h2>
                {isMoved && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetPosition();
                    }}
                    className="text-[11px] text-text-brand hover:underline font-semibold cursor-pointer"
                  >
                    (Reset position)
                  </button>
                )}
              </div>
              <p className="font-sans text-xs text-text-muted">
                Total Sold: <strong className="text-text-primary">{tickets.length}</strong> / {raffle.totalTickets} tickets
                {raffle.pricePerTicket && ` • £${Number(raffle.pricePerTicket).toFixed(2)} per ticket`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isMoved && (
              <button
                type="button"
                onClick={resetPosition}
                title="Reset window to center"
                className="p-1.5 rounded-[8px] bg-accent-bg border border-border text-text-muted hover:text-text-primary cursor-pointer text-xs min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              disabled={tickets.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-accent-bg border border-border hover:border-primary text-text-brand font-sans font-medium text-[12px] transition-colors disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-surface border border-border text-text-muted hover:text-text-primary hover:border-border-medium transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Toolbar (Search & View Toggle) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-b border-divider bg-surface">
          <div className="flex items-center h-[36px] w-full sm:w-[320px] bg-bg border border-border rounded-[8px] px-3">
            <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search by ticket #, buyer name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-text-primary text-[12px] placeholder:text-text-muted w-full ml-2 font-sans"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface p-1 rounded-[8px] border border-border">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded-[6px] text-[11px] font-sans font-medium transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              📋 Table View
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-[6px] text-[11px] font-sans font-medium transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              🔢 Ticket Badges
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[60vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="font-sans text-xs text-text-muted">Loading competition tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-3xl mb-2">🎟️</span>
              <p className="font-heading font-medium text-sm text-text-primary mb-1">
                {tickets.length === 0 ? "No tickets have been sold yet" : "No matching tickets found"}
              </p>
              <p className="font-sans text-xs text-text-muted">
                {tickets.length === 0 ? "Tickets will appear here as soon as buyers enter this raffle." : "Try adjusting your search criteria."}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* Badges Grid View */
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
              {filteredTickets.map((t) => {
                const isMainWin = t.winStatus?.includes("Main");
                const isInstantWin = t.winStatus?.includes("Instant");

                let badgeColor = "bg-surface border-border text-text-primary";
                if (isMainWin) {
                  badgeColor = "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-sm";
                } else if (isInstantWin) {
                  badgeColor = "bg-amber-50 border-amber-500 text-amber-700 font-bold";
                }

                return (
                  <div
                    key={t.id}
                    title={`${t.buyerName || t.userName} (${t.userEmail})\nStatus: ${t.winStatus}`}
                    className={`flex flex-col items-center justify-center p-2 rounded-[10px] border transition-all hover:scale-105 cursor-pointer ${badgeColor}`}
                  >
                    <span className="font-sans font-bold text-xs">#{t.ticketNumber}</span>
                    <span className="font-sans text-[10px] text-text-muted truncate max-w-full">
                      {t.buyerName?.split(" ")[0] || "User"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Full Table View */
            <div className="w-full border border-border rounded-[12px] overflow-hidden">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-divider bg-elevated/70 text-text-muted font-sans font-medium text-[10px] uppercase">
                    <th className="py-3 px-4">TICKET #</th>
                    <th className="py-3 px-4">BUYER / CLIENT NAME</th>
                    <th className="py-3 px-4">BUYER EMAIL</th>
                    <th className="py-3 px-4">PHONE</th>
                    <th className="py-3 px-4 text-center">WIN STATUS</th>
                    <th className="py-3 px-4 text-right">PURCHASE DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t, idx) => {
                    const isMainWin = t.winStatus?.includes("Main");
                    const isInstantWin = t.winStatus?.includes("Instant");

                    return (
                      <tr
                        key={t.id}
                        className={`${idx !== filteredTickets.length - 1 ? "border-b border-divider" : ""} hover:bg-accent-bg/30 transition-colors`}
                      >
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-[4px] bg-accent-bg border border-border text-text-brand font-sans font-bold text-[11px]">
                            #{t.ticketNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-text-primary">
                          {t.buyerName || t.userName || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {t.userEmail || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {t.userPhone || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isMainWin ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-bold">
                              🏆 Main Winner
                            </span>
                          ) : isInstantWin ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-[10px] font-bold">
                              ⚡ Instant Winner
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-elevated border border-border text-text-muted text-[10px]">
                              Regular Entry
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-text-muted">
                          {t.createdAt ? format(new Date(t.createdAt), "dd MMM yyyy HH:mm") : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-divider bg-elevated/60 shrink-0">
          <p className="font-sans text-xs text-text-muted">
            Showing <span className="text-text-primary font-medium">{filteredTickets.length}</span> of {tickets.length} total sold tickets
          </p>
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-[8px] bg-surface border border-border hover:border-primary text-text-brand hover:text-text-primary font-sans font-medium text-xs transition-colors cursor-pointer flex items-center justify-center"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}
