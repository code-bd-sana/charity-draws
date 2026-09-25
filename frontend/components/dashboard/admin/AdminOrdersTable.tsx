"use client";

import React, { useState } from "react";
import ProcessRefundModal, { OrderData } from "./ProcessRefundModal";
import { useAdminOrders } from "../../../hooks/useAdminHooks";
import EmptyState from "../../ui/EmptyState";

export default function AdminOrdersTable() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const { data: response, isLoading } = useAdminOrders({ page, limit: 10 });

  const handleRefund = (order: OrderData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case "Paid":
      case "Completed":
        return <span className="px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-[10px] shadow-sm">{status}</span>;
      case "Refunded":
        return <span className="px-3 py-1 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[10px] shadow-sm">{status}</span>;
      case "Failed":
        return <span className="px-3 py-1 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[10px] shadow-sm">{status}</span>;
      default:
        return <span className="px-3 py-1 rounded-badge border border-border bg-bg text-text-muted font-sans font-semibold text-[10px] shadow-sm">{status}</span>;
    }
  };

  const orders = response?.orders || [];
  const totalPages = response?.totalPages || 1;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    } catch {
      return isoString || 'N/A';
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
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
                    description="There are currently no ticket purchase transactions recorded."
                  />
                </td>
              </tr>
            ) : (
              orders.map((order: OrderData, i: number) => (
                <tr key={order.id} className={`${i !== orders.length - 1 ? 'border-b border-divider' : ''} hover:bg-accent-bg/30 transition-colors`}>
                  <td className="py-4 px-6">
                    <span className="font-sans font-semibold text-[13px] text-text-brand">#{order.orderId || order.id.slice(-6).toUpperCase()}</span>
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
                    <div className="flex items-center justify-end gap-4">
                      <button className="text-text-muted hover:text-text-brand transition-colors cursor-pointer" title="View Details">
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
    </div>
  );
}
