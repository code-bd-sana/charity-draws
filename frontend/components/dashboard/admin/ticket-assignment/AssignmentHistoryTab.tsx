"use client";

import React, { useState } from "react";
import { useAdminAssignmentHistory } from "../../../../hooks/useAdminHooks";
import { format } from "date-fns";
import { Search, ShieldCheck, Zap, Download, RefreshCw } from "lucide-react";

export default function AssignmentHistoryTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 10;

  const { data, isLoading, isError, refetch, isFetching } = useAdminAssignmentHistory({
    page,
    limit,
    search: search.trim() || undefined,
  });

  const history = data?.history || [];
  const totalPages = data?.totalPages || 1;
  const totalRecords = data?.total || 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = [
      "Date",
      "Order ID",
      "Recipient Name",
      "Recipient Email",
      "Competition",
      "Tickets Count",
      "Ticket Numbers",
      "Total Value (£)",
      "Channel",
      "Admin Notes",
    ];

    const rows = history.map((item) => [
      format(new Date(item.date), "yyyy-MM-dd HH:mm"),
      item.orderId,
      item.recipient.name,
      item.recipient.email,
      item.competition.title,
      item.ticketCount,
      item.assignedNumbers.join("; "),
      item.totalValue.toFixed(2),
      item.paymentGateway,
      item.adminNotes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin_manual_assignments_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      {/* Top Filter and Controls Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border shadow-card">
        <div>
          <h2 className="font-heading font-bold text-lg text-text-primary">
            Manual Assignment Audit History
          </h2>
          <p className="text-xs text-text-muted">
            All historical admin manual ticket allocations ({totalRecords} records found)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search ID, user, raffle..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-9 bg-bg border border-border rounded-button pl-9 pr-3 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-primary font-sans"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-9 h-9 rounded-button bg-surface border border-border hover:bg-accent-bg flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="h-9 px-3.5 rounded-button bg-accent-bg border border-border-medium hover:bg-primary text-text-brand hover:text-white font-sans font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm shrink-0 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden shadow-card overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1050px] text-left border-collapse font-sans">
          <thead>
            <tr className="border-b border-border bg-accent-bg/50 text-[11px] font-bold text-text-muted uppercase tracking-wider">
              <th className="py-4 px-6 w-[14%]">DATE & TIME</th>
              <th className="py-4 px-6 w-[15%]">ORDER / REF ID</th>
              <th className="py-4 px-6 w-[20%]">RECIPIENT USER</th>
              <th className="py-4 px-6 w-[20%]">COMPETITION</th>
              <th className="py-4 px-6 w-[15%]">ASSIGNED TICKETS</th>
              <th className="py-4 px-6 w-[10%] text-right">TOTAL VALUE</th>
              <th className="py-4 px-6 w-[16%] text-center">CHANNEL</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-divider animate-pulse">
                  <td className="py-4 px-6">
                    <div className="h-4 w-28 bg-accent-bg rounded" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-32 bg-accent-bg rounded" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-36 bg-accent-bg rounded" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-40 bg-accent-bg rounded" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-24 bg-accent-bg rounded" />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="h-4 w-16 bg-accent-bg rounded ml-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-6 w-24 bg-accent-bg rounded-full mx-auto" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-red-600 font-semibold text-sm">
                  Failed to load assignment history. Please try again.
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-text-muted text-sm">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-text-muted opacity-50" />
                    <span className="font-semibold text-text-primary">
                      No manual ticket assignments found
                    </span>
                    <p className="text-xs text-text-muted">
                      Use the &quot;Assign Tickets&quot; tab to allocate complimentary tickets to users.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              history.map((item, index) => (
                <tr
                  key={item.id}
                  className={`hover:bg-accent-bg/30 transition-colors ${
                    index !== history.length - 1 ? "border-b border-divider" : ""
                  }`}
                >
                  {/* Date & Time */}
                  <td className="py-4 px-6">
                    <span className="text-xs font-medium text-text-muted whitespace-nowrap">
                      {format(new Date(item.date), "dd MMM yyyy, HH:mm")}
                    </span>
                  </td>

                  {/* Order ID */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-xs text-text-brand truncate max-w-[150px]" title={item.orderId}>
                        {item.orderId}
                      </span>
                      {item.adminNotes && (
                        <span className="text-[10px] text-text-muted italic truncate max-w-[150px]" title={item.adminNotes}>
                          &quot;{item.adminNotes}&quot;
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Recipient User */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-accent-bg border border-border flex items-center justify-center font-bold text-xs text-text-brand shrink-0 overflow-hidden">
                        {item.recipient.avatarUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.recipient.avatarUrl}
                            alt={item.recipient.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.recipient.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-xs text-text-primary truncate max-w-[140px]" title={item.recipient.name}>
                          {item.recipient.name}
                        </span>
                        <span className="text-[11px] text-text-muted truncate max-w-[140px]" title={item.recipient.email}>
                          {item.recipient.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Competition */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-accent-bg border border-border shrink-0 overflow-hidden">
                        {item.competition.mainImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.competition.mainImage}
                            alt={item.competition.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">
                            🎟️
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-xs text-text-primary truncate max-w-[160px]" title={item.competition.title}>
                        {item.competition.title}
                      </span>
                    </div>
                  </td>

                  {/* Assigned Tickets */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-badge bg-primary/10 border border-primary/30 text-text-brand font-bold text-[11px]">
                          {item.ticketCount} {item.ticketCount === 1 ? "Ticket" : "Tickets"}
                        </span>
                        {item.instantWins && item.instantWins.length > 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded-badge bg-amber-500/20 text-amber-700 font-bold text-[10px] flex items-center gap-0.5"
                            title={`Instant win unlocked: ${item.instantWins.join(", ")}`}
                          >
                            <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                            <span>{item.instantWins.length} Win</span>
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-text-muted truncate max-w-[180px]">
                        {item.assignedNumbers.slice(0, 5).map((n) => `#${n}`).join(", ")}
                        {item.assignedNumbers.length > 5 ? ` +${item.assignedNumbers.length - 5} more` : ""}
                      </span>
                    </div>
                  </td>

                  {/* Total Value */}
                  <td className="py-4 px-6 text-right">
                    <span className="font-mono font-bold text-xs text-text-primary">
                      £{item.totalValue.toFixed(2)}
                    </span>
                  </td>

                  {/* Channel Badge */}
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-badge bg-primary/10 border border-primary/30 text-text-brand font-bold text-[11px] shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      <span>ADMIN MANUAL</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between p-4 bg-surface border-t border-divider">
          <span className="text-xs text-text-muted font-medium">
            Showing {history.length} of {totalRecords} records
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 h-8 rounded-button border border-border hover:bg-accent-bg disabled:opacity-30 disabled:cursor-not-allowed bg-surface text-text-primary text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
              >
                Prev
              </button>
              <span className="text-text-muted px-2 text-xs font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 h-8 rounded-button border border-border hover:bg-accent-bg disabled:opacity-30 disabled:cursor-not-allowed bg-surface text-text-primary text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
