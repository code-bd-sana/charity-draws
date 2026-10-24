"use client";

import React, { useState } from "react";
import TicketsTable, { Ticket } from "@/components/dashboard/TicketsTable";
import { useMyTicketsQuery } from "../../../../hooks/useTicketHooks";
import { format } from "date-fns";

export default function UserTicketsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const {
    data: ticketsData,
    isLoading,
    isFetching,
    isError,
  } = useMyTicketsQuery({
    page,
    limit,
    status: status !== "all" ? status : undefined,
    search: search.trim() ? search.trim() : undefined,
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-text-muted font-sans font-medium flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading your tickets...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-600 font-sans font-semibold bg-red-50 border border-red-200 rounded-card">
        Failed to load tickets. Please refresh or try again later.
      </div>
    );
  }

  // Handle both paginated response object and legacy array fallback
  const isPaginated = !Array.isArray(ticketsData) && ticketsData?.pagination;
  const backendTickets: any[] = isPaginated
    ? ticketsData.tickets
    : Array.isArray(ticketsData)
    ? ticketsData
    : [];

  const pagination = isPaginated
    ? ticketsData.pagination
    : {
        total: backendTickets.length,
        page: 1,
        limit,
        totalPages: Math.ceil(backendTickets.length / limit) || 1,
      };

  const stats = isPaginated ? ticketsData.stats : null;

  const formattedTickets: Ticket[] = backendTickets.map((t: any) => {
    let ticketStatus: Ticket["status"] = "live";
    if (t.raffle?.status === "ENDED") {
      const hasWon = t.winners && t.winners.length > 0;
      ticketStatus = hasWon ? "drawn-won" : "drawn-lost";
    } else {
      const hasInstantWin = t.winners?.some((w: any) => w.winType === "INSTANT_WIN");
      if (hasInstantWin) {
        ticketStatus = "instant-win";
      }
    }
    const isAdminAssigned = t.transaction?.paymentGateway === "ADMIN_MANUAL";
    return {
      id: t.id,
      ticketId: `#TKT-${t.ticketNumber}`,
      competitionName: t.raffle?.title || "Competition",
      purchaseDate: t.createdAt ? format(new Date(t.createdAt), "dd MMM yyyy") : "N/A",
      pricePaid: isAdminAssigned
        ? "Admin Assigned"
        : t.raffle?.pricePerTicket
        ? `£${Number(t.raffle.pricePerTicket).toFixed(2)}`
        : "Paid",
      status: ticketStatus,
      isAdminAssigned,
      raw: t,
    };
  });

  // Calculate stats from backend query or fallback to local calculation
  const totalOwned = stats ? stats.totalOwned : formattedTickets.length;
  const activeTickets = stats
    ? stats.activeTickets
    : formattedTickets.filter((t) => t.status === "live" || t.status === "instant-win").length;
  const wonTickets = stats
    ? stats.wonTickets
    : formattedTickets.filter((t) => t.status === "drawn-won" || t.status === "instant-win").length;

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-1">My Tickets</h1>
        <p className="font-sans text-sm text-text-muted font-medium">
          View and manage all your purchased competition tickets and live entries.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        {/* Total Tickets Owned */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Total Tickets Owned
          </p>
          <p className="font-heading font-bold text-[36px] leading-tight text-text-primary">
            {totalOwned}
          </p>
          <span className="font-sans text-[11px] font-medium text-text-muted">
            All time purchased
          </span>
        </div>

        {/* Active Tickets */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Active Tickets
          </p>
          <p className="font-heading font-bold text-[36px] leading-tight text-text-brand">
            {activeTickets}
          </p>
          <span className="font-sans text-[11px] font-medium text-text-muted">
            Currently in active draws
          </span>
        </div>

        {/* Tickets in Won Competitions */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card hover:border-border-medium hover:shadow-glow transition-all">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Prizes Won
          </p>
          <p className="font-heading font-bold text-[36px] leading-tight text-emerald-700">
            {wonTickets}
          </p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 w-fit shadow-sm">
            <span className="font-sans text-[10px] font-semibold text-emerald-700">
              {wonTickets} lucky winning {wonTickets === 1 ? "ticket" : "tickets"}
            </span>
          </div>
        </div>
      </div>

      {/* Tickets Data Table Component with Server-side Pagination & Filtering */}
      <TicketsTable
        tickets={formattedTickets}
        totalTickets={pagination.total}
        currentPage={page}
        totalPages={pagination.totalPages}
        pageSize={limit}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setLimit(newSize);
          setPage(1);
        }}
        statusFilter={status}
        onStatusFilterChange={(newStatus) => {
          setStatus(newStatus);
          setPage(1);
        }}
        searchQuery={search}
        onSearchChange={(newSearch) => {
          setSearch(newSearch);
          setPage(1);
        }}
        isLoading={isFetching}
      />
    </div>
  );
}
