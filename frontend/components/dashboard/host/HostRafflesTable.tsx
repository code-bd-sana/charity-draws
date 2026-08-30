"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useHostRaffles, useDeleteRaffle, useDrawWinner } from "../../../hooks/useRaffleHooks";
import { cn } from "../../../lib/utils";
import { Pagination } from "../../ui/Pagination";
import { toast } from "sonner";
import ConfirmDeleteRaffleModal, { RaffleDeleteTarget } from "../shared/ConfirmDeleteRaffleModal";

const filters = ["All", "Live", "Pending Review", "Ended", "Drafts"];

export default function HostRafflesTable() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drawingId, setDrawingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedCompForDelete, setSelectedCompForDelete] = useState<RaffleDeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: response, isLoading } = useHostRaffles({ page, limit: 10, status: activeFilter });
  const raffles = response?.data || [];
  const meta = response?.meta;
  const totalPages = Math.max(1, Number(meta?.totalPages ?? meta?.lastPage) || 1);
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const firstVisibleItem = meta && raffles.length > 0 ? (currentPage - 1) * meta.limit + 1 : 0;
  const lastVisibleItem = meta && raffles.length > 0 ? Math.min(firstVisibleItem + raffles.length - 1, meta.total) : 0;
  const deleteMutation = useDeleteRaffle();
  const drawWinnerMutation = useDrawWinner();

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleConfirmDelete = async () => {
    if (!selectedCompForDelete) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(selectedCompForDelete.id);
      toast.success("Competition deleted successfully");
      setSelectedCompForDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete competition");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setPage(1);
              }}
              className={cn(
                "h-8 px-4 rounded-full border transition-all flex items-center justify-center font-sans text-xs cursor-pointer",
                activeFilter === filter
                  ? "bg-primary border-primary text-primary-text font-bold shadow-glow"
                  : "bg-surface border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40 font-medium"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <Link 
          href="/dashboard/host/create"
          className="h-10 px-5 bg-primary hover:bg-primary-hover text-primary-text font-heading font-semibold text-xs md:text-sm transition-all rounded-button flex items-center justify-center shrink-0 shadow-glow cursor-pointer"
        >
          <span>+ Create Raffle</span>
        </Link>
      </div>

      {/* Table Container */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden flex flex-col shadow-card">
        {/* Table Header */}
        <div className="grid grid-cols-5 items-center px-6 h-12 border-b border-divider bg-accent-bg/30">
          <div className="col-span-2 sm:col-span-1">
            <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">
              Raffle Name
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">
              Tickets Sold
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">
              Raised
            </span>
          </div>
          <div>
            <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">
              Status
            </span>
          </div>
          <div className="hidden md:block text-right">
            <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">
              Ends
            </span>
          </div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col">
          {isLoading && (
            <div className="flex flex-col w-full animate-in fade-in duration-300">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-5 items-center px-6 min-h-[72px] py-3 border-b border-divider last:border-b-0 bg-surface">
                  {/* Raffle Name */}
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-3 pr-4">
                    <div className="w-3 h-3 shrink-0 bg-accent-bg rounded-sm animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                    <div className="h-4.5 w-36 bg-accent-bg rounded animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                  </div>
                  
                  {/* Tickets Sold */}
                  <div className="hidden sm:block">
                    <div className="h-4 w-20 bg-accent-bg rounded animate-pulse" style={{ animationDelay: `${i * 150 + 50}ms` }}></div>
                  </div>
                  
                  {/* Raised */}
                  <div className="hidden sm:block">
                    <div className="h-4 w-16 bg-accent-bg rounded animate-pulse" style={{ animationDelay: `${i * 150 + 100}ms` }}></div>
                  </div>
                  
                  {/* Status */}
                  <div>
                    <div className="h-5.5 w-18 bg-accent-bg rounded-full animate-pulse" style={{ animationDelay: `${i * 150 + 150}ms` }}></div>
                  </div>
                  
                  {/* Ends */}
                  <div className="hidden md:flex justify-end">
                    <div className="h-4 w-24 bg-accent-bg rounded animate-pulse ml-auto" style={{ animationDelay: `${i * 150 + 200}ms` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && raffles.map((raffle: any) => {
            const isExpanded = expandedId === raffle.id;
            return (
              <div key={raffle.id} className="flex flex-col border-b border-divider last:border-b-0">
                {/* Main Row */}
                <div
                  onClick={() => toggleRow(raffle.id)}
                  className="grid grid-cols-5 items-center px-6 min-h-[72px] py-3 cursor-pointer hover:bg-accent-bg/40 transition-colors bg-surface"
                >
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-3 min-w-0 pr-4">
                    <svg
                      className={cn(
                        "w-3.5 h-3.5 shrink-0 text-text-muted transition-transform duration-200",
                        isExpanded ? "rotate-180" : "rotate-0"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                    <span className="font-heading font-semibold text-xs md:text-sm text-text-primary truncate">
                      {raffle.title}
                    </span>
                  </div>
                  
                  <div className="hidden sm:block">
                    <span className="font-sans font-semibold text-xs md:text-sm text-text-brand">
                      {raffle.ticketsSold} / {raffle.totalTickets}
                    </span>
                  </div>
                  
                  <div className="hidden sm:block">
                    <span className="font-heading font-bold text-xs md:text-sm text-text-primary">
                      £{(Number(raffle.pricePerTicket) * raffle.ticketsSold).toFixed(2)}
                    </span>
                  </div>
                  
                  <div>
                    <div className={cn(
                      "inline-flex px-2.5 py-0.5 items-center justify-center rounded-badge border shadow-sm",
                      raffle.status === "ACTIVE" && "bg-emerald-50 border-emerald-200 text-emerald-700",
                      raffle.status === "ENDED" && "bg-red-50 border-red-200 text-red-700",
                      raffle.status === "DRAFT" && "bg-purple-50 border-border-medium text-text-brand",
                      raffle.status === "PENDING_APPROVAL" && "bg-amber-50 border-amber-200 text-amber-700",
                      raffle.status === "CANCELLED" && "bg-red-50 border-red-200 text-red-700"
                    )}>
                      <span className="font-sans font-bold text-[11px]">
                        {raffle.status === "ACTIVE" ? "Live" : raffle.status === "PENDING_APPROVAL" ? "Pending Review" : raffle.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex justify-end min-w-0">
                    <span className="font-sans font-medium text-xs text-text-muted truncate">
                      {new Date(raffle.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="w-full bg-bg border-t border-divider px-6 py-6 md:py-8 flex flex-col md:flex-row gap-6 md:gap-16 animate-fadeIn">
                    {/* Gross Revenue */}
                    <div className="flex flex-col gap-1.5">
                      <span className="font-sans font-semibold text-[11px] tracking-wider uppercase text-text-muted">
                        Gross Revenue
                      </span>
                      <div className="flex flex-col">
                        <span className="font-heading font-bold text-2xl text-text-primary">
                          £{(Number(raffle.pricePerTicket) * raffle.ticketsSold).toFixed(2)}
                        </span>
                        <span className="font-sans text-xs text-text-muted font-medium">
                          {raffle.ticketsSold} tickets × £{Number(raffle.pricePerTicket).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Platform Fee */}
                    <div className="flex flex-col gap-1.5">
                      <span className="font-sans font-semibold text-[11px] tracking-wider uppercase text-text-muted">
                        Platform Fee
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-bold text-2xl text-red-600">
                          - £{((Number(raffle.pricePerTicket) * raffle.ticketsSold) * 0.05).toFixed(2)}
                        </span>
                        <div className="px-2 py-0.5 bg-accent-bg border border-border-medium rounded-full flex items-center justify-center">
                          <span className="font-sans font-semibold text-[10px] text-text-brand">
                            5% (Standard)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block w-px bg-divider shrink-0 self-stretch" />

                    {/* Your Earnings */}
                    <div className="flex flex-col gap-1.5 flex-1">
                      <span className="font-sans font-semibold text-[11px] tracking-wider uppercase text-text-muted">
                        Your Earnings
                      </span>
                      <div className="flex flex-col relative w-full">
                        <span className="font-heading font-bold text-2xl text-text-brand">
                          £{((Number(raffle.pricePerTicket) * raffle.ticketsSold) * 0.95).toFixed(2)}
                        </span>
                        <span className="font-sans text-xs text-text-muted font-medium">
                          Paid out on completion
                        </span>
                        
                        {/* Action buttons */}
                        <div className="mt-4 md:absolute md:bottom-0 md:right-0 md:mt-0 flex gap-3 items-center">
                          {raffle.status === "ACTIVE" && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Are you sure you want to run the draw now?")) {
                                  setDrawingId(raffle.id);
                                  try {
                                    await new Promise(res => setTimeout(res, 3000));
                                    await drawWinnerMutation.mutateAsync(raffle.id);
                                    toast.success("Draw completed successfully!");
                                  } catch (err: any) {
                                    toast.error(err?.response?.data?.message || "Failed to run draw");
                                  } finally {
                                    setDrawingId(null);
                                  }
                                }
                              }}
                              disabled={drawingId === raffle.id}
                              className="font-sans font-bold text-xs px-4 py-2 bg-primary hover:bg-primary-hover text-primary-text rounded-button transition-colors flex items-center shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                              {drawingId === raffle.id ? "Drawing..." : "Run Draw Now"}
                            </button>
                          )}
                          {raffle.status === "ENDED" && (
                            <Link
                              href="/dashboard/host/winners"
                              onClick={(e) => e.stopPropagation()}
                              className="font-sans font-bold text-xs px-4 py-2 bg-accent-bg border border-border-medium text-text-brand rounded-button hover:bg-primary hover:text-primary-text transition-all flex items-center shadow-sm"
                            >
                              View Winners
                            </Link>
                          )}
                          <Link
                            href={`/dashboard/host/competitions/${raffle.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-sans font-semibold text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 ml-2"
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompForDelete(raffle);
                            }}
                            disabled={deleteMutation.isPending || isDeleting}
                            className="font-sans font-semibold text-xs text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 ml-2 cursor-pointer disabled:opacity-50"
                          >
                            Delete Competition
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {!isLoading && raffles?.length === 0 && (
            <div className="p-8 text-center text-text-muted font-sans text-xs md:text-sm font-medium">
              No competitions found.
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && meta && meta.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:flex-row">
          <p className="font-sans text-[13px] font-medium text-text-muted">
            Showing <span className="font-bold text-text-primary">{firstVisibleItem}–{lastVisibleItem}</span> of{" "}
            <span className="font-bold text-text-primary">{meta.total}</span> competitions
            {totalPages > 1 && (
              <> · Page <span className="font-bold text-text-brand">{currentPage}</span> of {totalPages}</>
            )}
          </p>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {selectedCompForDelete && (
        <ConfirmDeleteRaffleModal
          isOpen={!!selectedCompForDelete}
          onClose={() => setSelectedCompForDelete(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          raffle={selectedCompForDelete}
        />
      )}
    </div>
  );
}
