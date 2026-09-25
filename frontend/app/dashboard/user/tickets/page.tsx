"use client";

import React from "react";
import TicketsTable, { Ticket } from "@/components/dashboard/TicketsTable";
import { useMyTicketsQuery } from "../../../../hooks/useTicketHooks";
import { format } from "date-fns";

export default function UserTicketsPage() {
  const { data: ticketsData, isLoading, isError } = useMyTicketsQuery();

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted font-sans font-medium">Loading tickets...</div>;
  }
  if (isError) {
    return <div className="p-8 text-center text-red-600 font-sans font-semibold">Failed to load tickets.</div>;
  }

  const backendTickets = ticketsData || [];

  const formattedTickets: Ticket[] = backendTickets.map((t: any) => {
    let status: Ticket["status"] = "live";
    if (t.raffle.status === "ENDED") {
      const hasWon = t.winners && t.winners.length > 0;
      status = hasWon ? "drawn-won" : "drawn-lost";
    } else {
      const hasInstantWin = t.winners?.some((w: any) => w.winType === 'INSTANT_WIN');
      if (hasInstantWin) {
        status = "instant-win";
      }
    }
    return {
      id: t.id,
      ticketId: `#TKT-${t.ticketNumber}`,
      competitionName: t.raffle.title,
      purchaseDate: format(new Date(t.createdAt), "dd MMM yyyy"),
      pricePaid: "Paid",
      status,
      raw: t,
    };
  });

  const totalOwned = formattedTickets.length;
  const activeTickets = formattedTickets.filter((t) => t.status === "live" || t.status === "instant-win").length;
  const wonTickets = formattedTickets.filter((t) => t.status === "drawn-won" || t.status === "instant-win").length;

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">My Tickets</h1>
        <p className="font-sans text-sm text-text-muted font-medium">
          View and manage all your purchased competition tickets.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        {/* Total Tickets Owned */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-3 shadow-card hover:border-border-medium hover:shadow-glow transition-all">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Total Tickets Owned
          </p>
          <p className="font-heading font-bold text-[36px] leading-tight text-text-primary">
            {totalOwned}
          </p>
          <span className="font-sans text-[11px] font-medium text-text-muted">
            All time
          </span>
        </div>

        {/* Active Tickets */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-3 shadow-card hover:border-border-medium hover:shadow-glow transition-all">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Active Tickets
          </p>
          <p className="font-heading font-bold text-[36px] leading-tight text-text-brand">
            {activeTickets}
          </p>
          <span className="font-sans text-[11px] font-medium text-text-muted">
            Current
          </span>
        </div>

        {/* Tickets in Won Competitions */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-3 shadow-card hover:border-border-medium hover:shadow-glow transition-all">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Tickets in Won Competitions
          </p>
          <p className="font-heading font-bold text-[36px] leading-tight text-emerald-700">
            {wonTickets}
          </p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 w-fit shadow-sm">
            <span className="font-sans text-[10px] font-semibold text-emerald-700">
              {wonTickets} prizes won
            </span>
          </div>
        </div>
      </div>

      {/* Tickets Data Table Component */}
      <TicketsTable tickets={formattedTickets} />
    </div>
  );
}
