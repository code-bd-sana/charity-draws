"use client";

import React, { useState } from "react";
import { Ticket as TicketIcon } from "lucide-react";
import CompetitionDetailsModal from "./CompetitionDetailsModal";
import EmptyState from "../ui/EmptyState";

export interface Ticket {
  id: string;
  ticketId: string;
  competitionName: string;
  purchaseDate: string;
  pricePaid: string;
  status: "live" | "drawn-won" | "drawn-lost" | "instant-win";
  isAdminAssigned?: boolean;
  raw?: any;
}

interface TicketsTableProps {
  tickets: Ticket[];
  totalTickets?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  searchQuery?: string;
  onSearchChange?: (search: string) => void;
  isLoading?: boolean;
}

export default function TicketsTable({
  tickets = [],
  totalTickets = 0,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  statusFilter = "all",
  onStatusFilterChange,
  searchQuery = "",
  onSearchChange,
  isLoading = false,
}: TicketsTableProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const effectiveTotal = totalTickets || tickets.length;
  const startItem = effectiveTotal > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, effectiveTotal);

  // If user has zero tickets overall (and no filters applied)
  if (effectiveTotal === 0 && !searchQuery && (!statusFilter || statusFilter === "all") && !isLoading) {
    return (
      <EmptyState
        icon={TicketIcon}
        title="No Tickets Purchased Yet"
        description="You haven't entered any competitions yet. Browse active draws and claim your tickets to win luxury tactical prizes!"
        actionText="Explore Competitions"
        actionHref="/live-raffles"
      />
    );
  }

  // Generate pagination page numbers array with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const statusOptions = [
    { id: "all", label: "All" },
    { id: "live", label: "Live" },
    { id: "instant-win", label: "Instant Win" },
    { id: "drawn-won", label: "Won" },
    { id: "drawn-lost", label: "Lost" },
  ];

  return (
    <>
      <div className="w-full bg-surface border border-border rounded-card p-6 flex flex-col gap-5 shadow-card select-none">
        
        {/* Top Header & Search/Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-heading font-bold text-lg text-text-primary">
              All Tickets
            </h3>
            <span className="px-2.5 py-0.5 rounded-badge bg-accent-bg border border-border text-[11px] font-sans font-semibold text-text-muted">
              {effectiveTotal} total
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search ticket # or raffle..."
                className="w-full h-9 pl-9 pr-8 bg-bg border border-border rounded-button focus:outline-none focus:border-primary text-text-primary font-sans text-xs transition-colors"
              />
              <svg
                className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange?.("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer p-0.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center bg-accent-bg/70 p-0.5 rounded-button border border-border text-xs overflow-x-auto">
              {statusOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onStatusFilterChange?.(opt.id)}
                  className={`px-3 py-1 rounded transition-all cursor-pointer font-sans whitespace-nowrap ${
                    statusFilter === opt.id
                      ? "bg-surface text-text-primary font-bold shadow-xs"
                      : "text-text-muted hover:text-text-primary font-medium"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table / Grid */}
        <div className="w-full overflow-x-auto relative min-h-[160px]">
          {isLoading && (
            <div className="absolute inset-0 bg-surface/60 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-card bg-surface border border-border shadow-md">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-sans font-medium text-text-muted">Loading tickets...</span>
              </div>
            </div>
          )}

          <div className="min-w-[900px] flex flex-col">
            {/* Table Header Row */}
            <div className="grid grid-cols-12 gap-4 pb-3.5 pt-2.5 border-b border-border font-sans text-[11px] font-bold text-text-muted uppercase tracking-wider bg-accent-bg/50 rounded-t-button">
              <div className="col-span-2 pl-4">Ticket ID</div>
              <div className="col-span-4">Competition Name</div>
              <div className="col-span-2">Purchase Date</div>
              <div className="col-span-1">Price Paid</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-right pr-4">Action</div>
            </div>

            {/* Table Body Rows */}
            <div className="flex flex-col">
              {tickets.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                  <p className="font-heading font-semibold text-sm text-text-primary">
                    No tickets found
                  </p>
                  <p className="font-sans text-xs text-text-muted max-w-sm">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search query or status filter to find what you are looking for."
                      : "You have no tickets in this section."}
                  </p>
                  {(searchQuery || statusFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        onSearchChange?.("");
                        onStatusFilterChange?.("all");
                      }}
                      className="mt-2 text-xs font-sans font-semibold text-text-brand hover:underline cursor-pointer"
                    >
                      Clear search & filters
                    </button>
                  )}
                </div>
              ) : (
                tickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className={`grid grid-cols-12 gap-4 py-3.5 items-center font-sans transition-colors hover:bg-accent-bg/30 ${
                      index !== tickets.length - 1 ? "border-b border-divider" : ""
                    }`}
                  >
                    {/* Ticket ID */}
                    <div className="col-span-2 pl-4 font-semibold text-[13px] text-text-brand font-mono">
                      {ticket.ticketId}
                    </div>

                    {/* Competition Name */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-button bg-bg border border-border flex items-center justify-center shrink-0 overflow-hidden relative">
                        {ticket.raw?.raffle?.mainImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={ticket.raw.raffle.mainImage}
                            alt={ticket.competitionName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-5 h-5 text-text-muted"
                            viewBox="0 0 100 100"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                          >
                            <circle cx="50" cy="50" r="30" />
                            <circle cx="50" cy="50" r="15" />
                          </svg>
                        )}
                      </div>
                      <span className="font-semibold text-[13px] text-text-primary truncate pr-4">
                        {ticket.competitionName}
                      </span>
                    </div>

                    {/* Purchase Date */}
                    <div className="col-span-2 font-medium text-[13px] text-text-muted">
                      {ticket.purchaseDate}
                    </div>

                    {/* Price Paid */}
                    <div className="col-span-1 font-semibold text-[13px] text-text-primary">
                      {ticket.isAdminAssigned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge bg-primary/10 border border-primary/30 text-text-brand font-bold text-[10px] whitespace-nowrap shadow-sm">
                          🛡️ Assigned
                        </span>
                      ) : (
                        ticket.pricePaid
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex justify-center">
                      {ticket.status === "live" && (
                        <div className="px-3 py-0.5 rounded-badge border border-amber-200 bg-amber-50 shadow-sm">
                          <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">
                            Live
                          </span>
                        </div>
                      )}
                      {ticket.status === "instant-win" && (
                        <div className="px-3 py-0.5 rounded-badge border border-purple-200 bg-purple-50 shadow-sm">
                          <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide">
                            Instant Win
                          </span>
                        </div>
                      )}
                      {ticket.status === "drawn-won" && (
                        <div className="px-3 py-0.5 rounded-badge border border-emerald-200 bg-emerald-50 shadow-sm">
                          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">
                            Drawn — Won
                          </span>
                        </div>
                      )}
                      {ticket.status === "drawn-lost" && (
                        <div className="px-3 py-0.5 rounded-badge border border-border bg-bg shadow-sm">
                          <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">
                            Drawn — Lost
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="col-span-1 text-right pr-4">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="font-sans font-semibold text-[12px] text-text-brand hover:text-primary-hover transition-colors whitespace-nowrap group flex items-center justify-end gap-1 w-full cursor-pointer"
                      >
                        View <span className="hidden sm:inline">Details</span>
                        <svg
                          className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pagination Footer Bar */}
        {effectiveTotal > 0 && (
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Showing range + Rows per page */}
            <div className="flex items-center gap-4 text-xs font-sans text-text-muted">
              <span>
                Showing <strong className="text-text-primary">{startItem}</strong> to{" "}
                <strong className="text-text-primary">{endItem}</strong> of{" "}
                <strong className="text-text-primary">{effectiveTotal}</strong> tickets
              </span>

              {onPageSizeChange && (
                <div className="flex items-center gap-1.5 pl-3 border-l border-border">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="h-7 px-2 bg-bg border border-border rounded font-sans text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>per page</span>
                </div>
              )}
            </div>

            {/* Right: Numbered Page Navigation */}
            {totalPages > 1 && onPageChange && (
              <div className="flex items-center gap-1.5">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="px-2.5 py-1.5 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary text-xs font-sans font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Number Buttons */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, idx) => {
                    if (pageNum === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-text-muted font-mono">
                          ...
                        </span>
                      );
                    }
                    const isCurrent = pageNum === currentPage;
                    return (
                      <button
                        key={`page-${pageNum}`}
                        type="button"
                        disabled={isLoading}
                        onClick={() => onPageChange(Number(pageNum))}
                        className={`min-w-[32px] h-8 px-2 rounded-button text-xs font-sans font-semibold transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-primary text-white shadow-sm"
                            : "bg-surface border border-border hover:bg-accent-bg text-text-primary"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  disabled={currentPage >= totalPages || isLoading}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="px-2.5 py-1.5 rounded-button bg-surface border border-border hover:bg-accent-bg text-text-primary text-xs font-sans font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <CompetitionDetailsModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        allTickets={tickets}
      />
    </>
  );
}
