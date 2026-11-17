"use client";

import React, { useState, useEffect } from "react";
import ProcessRefundModal, { OrderData } from "./ProcessRefundModal";
import AdminOrderDetailModal from "./AdminOrderDetailModal";
import { useAdminOrders } from "../../../hooks/useAdminHooks";
import EmptyState from "../../ui/EmptyState";

export default function AdminOrdersTable() {
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<OrderData | null>(null);

  // Debounce search input to avoid API spam on each keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data: response, isLoading } = useAdminOrders({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: activeFilter !== "All" ? activeFilter : undefined,
  });

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleRefund = (order: OrderData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleViewDetails = (order: OrderData) => {
    setDetailOrder(order);
    setIsDetailModalOpen(true);
  };

  const orders = response?.orders || [];
  const totalPages = response?.totalPages || 1;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return isoString || "N/A";
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      "Order ID",
      "Buyer Name",
      "Buyer Email",
      "Buyer Phone",
      "Competition",
      "Tickets Count",
      "Amount (£)",
      "Payment Method",
      "Status",
      "Date",
    ];

    const rows = orders.map((order: OrderData) => [
      order.orderId || order.id,
      order.buyerName,
      order.buyerEmail,
      order.buyerPhone,
      order.competition,
      order.tickets,
      order.amount.toFixed(2),
      order.payment,
      order.status,
      formatDate(order.date),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case "Paid":
      case "Completed":
        return (
          <span className="px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-[10px] shadow-sm">
            {status}
          </span>
        );
      case "Refunded":
        return (
          <span className="px-3 py-1 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[10px] shadow-sm">
            {status}
          </span>
        );
      case "Failed":
        return (
          <span className="px-3 py-1 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[10px] shadow-sm">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-badge border border-border bg-bg text-text-muted font-sans font-semibold text-[10px] shadow-sm">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Controls Row: Search, Status Filters & Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border shadow-card">
        {/* Left: Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          {/* Search Input */}
          <div className="flex items-center h-[40px] w-full sm:w-[320px] bg-bg border border-border rounded-button px-3 focus-within:border-primary transition-colors">
            <svg
              className="w-4 h-4 text-text-muted shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by buyer, email, order ID..."
              value={searchInput}
              onChange={handleSearchChange}
              className="bg-transparent border-none outline-none text-text-primary text-[13px] placeholder:text-text-muted w-full ml-2 font-sans"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { label: "All", value: "All" },
              { label: "Completed / Paid", value: "Paid" },
              { label: "Refunded", value: "Refunded" },
              { label: "Failed", value: "Failed" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilterChange(filter.value)}
                className={`px-4 py-1.5 rounded-badge text-[12px] font-sans font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === filter.value
                    ? "bg-primary border-primary text-primary-text font-bold shadow-sm"
                    : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Export CSV */}
        <button
          onClick={handleExportCSV}
          disabled={orders.length === 0}
          className="group h-[40px] px-4 bg-accent-bg border border-border-medium hover:bg-primary rounded-button flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-sm"
        >
          <svg
            className="w-4 h-4 text-text-brand group-hover:text-white transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <span className="font-sans font-semibold text-[13px] text-text-brand group-hover:text-white transition-colors">
            Export CSV
          </span>
        </button>
      </div>

      {/* Table Container */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden shadow-card overflow-x-auto scrollbar-thin mt-2">
        <table className="w-full min-w-[1050px] text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-accent-bg/50">
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%]">ORDER ID</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]">BUYER</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]">COMPETITION</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[8%] text-center">TICKETS</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">AMOUNT</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">PAYMENT</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">STATUS</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-center">DATE</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-text-muted font-sans font-medium">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 px-6 text-center">
                  <EmptyState
                    title="No Orders Found"
                    description="No orders match the selected search or status criteria."
                  />
                </td>
              </tr>
            ) : (
              orders.map((order: OrderData, i: number) => (
                <tr key={order.id} className={`${i !== orders.length - 1 ? 'border-b border-divider' : ''} hover:bg-accent-bg/30 transition-colors`}>
                  <td className="py-4 px-6">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(order)}
                      className="font-sans font-semibold text-[13px] text-text-brand hover:underline cursor-pointer"
                      title="View Details"
                    >
                      #{order.orderId || order.id.slice(-6).toUpperCase()}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {order.buyerInitials && (
                        <div className="w-7 h-7 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0">
                          <span className="font-sans font-bold text-[10px] text-text-brand">{order.buyerInitials}</span>
                        </div>
                      )}
                      <span className="font-sans font-semibold text-[13px] text-text-primary">{order.buyerName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-sans font-semibold text-[13px] text-text-primary block truncate max-w-[200px]" title={order.competition}>
                      {order.competition}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-sans font-medium text-[13px] text-text-muted">{order.tickets}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-heading font-bold text-[13px] text-text-primary">£{order.amount.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-sans text-[12px] text-text-secondary font-medium">{order.payment}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getStatusPill(order.status)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-sans text-[13px] text-text-muted font-medium">{formatDate(order.date)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        type="button"
                        onClick={() => handleViewDetails(order)}
                        className="text-text-muted hover:text-text-brand p-1.5 rounded-button hover:bg-accent-bg transition-colors cursor-pointer" 
                        title="View Order Details"
                        aria-label="View Order Details"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </button>
                      
                      {order.status === "Paid" && (
                        <button 
                          onClick={() => handleRefund(order)}
                          className="font-sans font-semibold text-[12px] text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface border border-border rounded-card px-6 py-4 shadow-sm">
          <span className="font-sans text-[13px] text-text-muted font-medium">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-surface border border-border rounded-button text-text-primary text-[13px] font-semibold hover:bg-accent-bg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-surface border border-border rounded-button text-text-primary text-[13px] font-semibold hover:bg-accent-bg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ProcessRefundModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder} 
      />

      <AdminOrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={detailOrder}
        onRefundClick={handleRefund}
      />
    </div>
  );
}
