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
  raw?: any;
}

interface TicketsTableProps {
  tickets: Ticket[];
}

export default function TicketsTable({ tickets }: TicketsTableProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  if (!tickets || tickets.length === 0) {
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

  return (
    <>
      <div className="w-full bg-surface border border-border rounded-card p-6 flex flex-col shadow-card select-none">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading font-bold text-[18px] text-text-primary">
            All Tickets
          </h3>
          <button className="group flex items-center gap-2 px-4 py-1.5 rounded-button bg-accent-bg border border-border-medium hover:bg-primary transition-all shadow-sm cursor-pointer">
            <svg className="w-3.5 h-3.5 text-text-brand group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="font-sans font-semibold text-[12px] text-text-brand group-hover:text-white transition-colors">Export</span>
          </button>
        </div>

        {/* Table/Grid */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[900px] flex flex-col">
            {/* Table Header Row */}
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border font-sans text-[11px] font-bold text-text-muted uppercase tracking-wider bg-accent-bg/50 pt-2 rounded-t-button">
              <div className="col-span-2 pl-4">Ticket ID</div>
              <div className="col-span-4">Competition Name</div>
              <div className="col-span-2">Purchase Date</div>
              <div className="col-span-1">Price Paid</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-right pr-4">Action</div>
            </div>

            {/* Table Body Rows */}
            <div className="flex flex-col">
              {tickets.map((ticket, index) => (
                <div 
                  key={ticket.id} 
                  className={`grid grid-cols-12 gap-4 py-4 items-center font-sans transition-colors hover:bg-accent-bg/30 ${index !== tickets.length - 1 ? 'border-b border-divider' : ''}`}
                >
                  {/* Ticket ID */}
                  <div className="col-span-2 pl-4 font-semibold text-[13px] text-text-brand">
                    {ticket.ticketId}
                  </div>

                  {/* Competition Name */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-button bg-bg border border-border flex items-center justify-center shrink-0 overflow-hidden relative">
                      {ticket.raw?.raffle?.mainImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={ticket.raw.raffle.mainImage} alt={ticket.competitionName} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-text-muted" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
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
                    {ticket.pricePaid}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex justify-center">
                    {ticket.status === "live" && (
                      <div className="px-3 py-1 rounded-badge border border-amber-200 bg-amber-50 shadow-sm">
                        <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Live</span>
                      </div>
                    )}
                    {ticket.status === "instant-win" && (
                      <div className="px-3 py-1 rounded-badge border border-purple-200 bg-purple-50 shadow-sm">
                        <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide">Instant Win</span>
                      </div>
                    )}
                    {ticket.status === "drawn-won" && (
                      <div className="px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 shadow-sm">
                        <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Drawn — Won</span>
                      </div>
                    )}
                    {ticket.status === "drawn-lost" && (
                      <div className="px-3 py-1 rounded-badge border border-border bg-bg shadow-sm">
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">Drawn — Lost</span>
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
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
