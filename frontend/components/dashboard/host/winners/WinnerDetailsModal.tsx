"use client";

import React, { useState } from "react";
import { cn } from "../../../../lib/utils";
import { useRaffleWinners } from "../../../../hooks/useRaffleHooks";
import { toast } from "sonner";
import { raffleService } from "../../../../services/raffle.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  raffle: any;
}

export default function WinnerDetailsModal({ isOpen, onClose, raffle }: Props) {
  const [activeTab, setActiveTab] = useState<"Main Draw" | "Instant Wins">("Main Draw");
  const [updatingWinnerId, setUpdatingWinnerId] = useState<string | null>(null);
  
  const { data: winnersData, isLoading, refetch } = useRaffleWinners(raffle?.id);

  if (!isOpen || !raffle) return null;

  const mainDrawWinner = (winnersData as any)?.mainDraw?.[0];
  const instantWins = (winnersData as any)?.instantWins || [];

  const handleUpdateDelivery = async (winnerId: string, newStatus: string) => {
    setUpdatingWinnerId(winnerId);
    try {
      await raffleService.updateDeliveryStatus(winnerId, newStatus);
      toast.success(`Delivery status updated to ${newStatus}`);
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message || "Failed to update delivery status");
    } finally {
      setUpdatingWinnerId(null);
    }
  };

  const renderDeliveryBadge = (winnerObj: any, fallbackId?: string) => {
    const status = winnerObj?.deliveryStatus || winnerObj?.status || "PENDING";
    const winnerRecordId = winnerObj?.winnerRecordId || winnerObj?.id || fallbackId;

    if (!winnerRecordId) return null;

    return (
      <div className="flex items-center gap-2">
        <select
          value={status.toUpperCase()}
          disabled={updatingWinnerId === winnerRecordId}
          onChange={(e) => handleUpdateDelivery(winnerRecordId, e.target.value)}
          className={cn(
            "px-2.5 py-1 rounded-button font-sans font-semibold text-xs border outline-none cursor-pointer transition-colors bg-bg shadow-sm",
            status.toUpperCase() === "DELIVERED"
              ? "border-emerald-300 text-emerald-700 bg-emerald-50"
              : status.toUpperCase() === "SHIPPED"
              ? "border-blue-300 text-blue-700 bg-blue-50"
              : "border-amber-300 text-amber-700 bg-amber-50"
          )}
        >
          <option value="PENDING" className="bg-bg text-amber-700">Pending Dispatch</option>
          <option value="SHIPPED" className="bg-bg text-blue-700">Shipped</option>
          <option value="DELIVERED" className="bg-bg text-emerald-700">Delivered ✓</option>
        </select>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-surface border border-border rounded-card w-full max-w-[820px] shadow-2xl flex flex-col relative max-h-[85vh] overflow-hidden select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-divider bg-surface">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading font-bold text-lg md:text-xl text-text-primary">
              Competition Winners: {raffle.title}
            </h2>
            <span className="font-sans text-xs md:text-sm text-text-muted font-medium">
              View main draw winner and instant win prize claims. Update dispatch & delivery status.
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shrink-0 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-bg p-1 rounded-button border border-border w-fit mb-6">
            <button
              onClick={() => setActiveTab("Main Draw")}
              className={cn(
                "px-4 py-1.5 rounded-button font-sans text-xs transition-all cursor-pointer",
                activeTab === "Main Draw"
                  ? "bg-primary border border-primary text-primary-text font-bold shadow-sm"
                  : "text-text-secondary hover:text-text-primary font-semibold"
              )}
            >
              Main Draw Winner
            </button>
            <button
              onClick={() => setActiveTab("Instant Wins")}
              className={cn(
                "px-4 py-1.5 rounded-button font-sans text-xs transition-all cursor-pointer",
                activeTab === "Instant Wins"
                  ? "bg-primary border border-primary text-primary-text font-bold shadow-sm"
                  : "text-text-secondary hover:text-text-primary font-semibold"
              )}
            >
              Instant Wins ({instantWins.length})
            </button>
          </div>

          {isLoading ? (
            <div className="text-text-muted p-8 text-center text-xs md:text-sm font-sans font-medium">Loading winners list...</div>
          ) : (
            <div className="flex-1">
              {activeTab === "Main Draw" && (
                <div className="flex flex-col gap-4">
                  {mainDrawWinner ? (
                    <div className="bg-accent-bg/50 border border-border-medium rounded-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center text-2xl shrink-0 shadow-sm">
                          🏆
                        </div>
                        <div className="flex flex-col">
                          <span className="font-heading font-bold text-base md:text-lg text-text-primary">
                            {mainDrawWinner.user?.firstName
                              ? `${mainDrawWinner.user.firstName} ${mainDrawWinner.user.lastName || ''}`.trim()
                              : "Winner"}
                          </span>
                          <span className="font-sans text-xs md:text-sm text-text-brand font-bold mt-0.5">
                            Winning Ticket #{mainDrawWinner.ticket?.ticketNumber}
                          </span>
                          <span className="font-sans text-xs text-text-muted font-medium mt-1 font-mono">
                            Email: {mainDrawWinner.user?.email}
                          </span>
                          <span className="font-sans text-xs text-text-muted font-medium">
                            Prize: {mainDrawWinner.prizeName || raffle.title}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 border-t sm:border-t-0 border-divider pt-3 sm:pt-0 w-full sm:w-auto">
                        <span className="font-sans text-[10px] text-text-muted uppercase font-bold tracking-wider">Delivery Status</span>
                        {renderDeliveryBadge(mainDrawWinner)}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-bg border border-border rounded-card p-8 text-center text-text-muted text-xs md:text-sm font-medium">
                      No main draw winner has been selected yet by Admin.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Instant Wins" && (
                <div className="flex flex-col gap-3">
                  {instantWins.length === 0 ? (
                    <div className="bg-bg border border-border rounded-card p-8 text-center text-text-muted text-xs md:text-sm font-medium">
                      No instant win prizes were created for this competition.
                    </div>
                  ) : (
                    instantWins.map((iw: any) => (
                      <div key={iw.id} className="bg-bg border border-border rounded-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-button bg-accent-bg border border-border-medium flex items-center justify-center text-lg shrink-0 shadow-sm">
                            🎁
                          </div>
                          <div className="flex flex-col">
                            <span className="font-heading font-bold text-xs md:text-sm text-text-primary">
                              {iw.prizeName}
                            </span>
                            <span className="font-sans text-xs font-bold text-text-brand">
                              Ticket #{iw.ticketNumber}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-4 border-t sm:border-t-0 border-divider pt-2 sm:pt-0">
                          {iw.winner ? (
                            <div className="flex flex-col items-start sm:items-end">
                              <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">
                                {iw.winner.firstName} {iw.winner.lastName}
                              </span>
                              <span className="font-sans text-xs text-text-muted font-mono">
                                {iw.winner.email}
                              </span>
                            </div>
                          ) : (
                            <span className="font-sans text-xs text-text-muted uppercase font-bold tracking-wider">
                              Unclaimed
                            </span>
                          )}

                          {iw.winner && renderDeliveryBadge(iw.winner, iw.id)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-divider flex justify-end bg-surface">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-bg border border-border hover:bg-accent-bg/50 transition-all rounded-button font-heading font-semibold text-xs md:text-sm text-text-primary cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
