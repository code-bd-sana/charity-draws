"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useUserTransactionsQuery } from "../../../../hooks/useUserHooks";

export default function UserTransactionsPage() {
  const { data: transactionsData, isLoading, isError } = useUserTransactionsQuery();
  const [filter, setFilter] = useState<string>("All");

  const transactions = transactionsData || [];

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "Purchases") return t.type === "TICKET_PURCHASE";
    if (filter === "Refunds") return t.status === "refunded";
    return true;
  });

  const totalSpent = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-fadeIn select-none p-2">
        <div className="bg-surface border border-border rounded-card p-8 h-40 animate-pulse" />
        <div className="bg-surface border border-border rounded-card p-6 h-96 animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500 bg-surface border border-border rounded-card">
        Failed to load transactions. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">My Transactions</h1>
        <p className="font-sans text-sm text-text-muted font-medium">
          View your payment history, purchases, and refund records.
        </p>
      </div>

      {/* Top Summary Card */}
      <div className="bg-surface border border-border rounded-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-card">
        <div className="flex flex-col gap-2">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Total Spent Lifetime
          </span>
          <p className="font-heading font-bold text-[36px] leading-tight text-text-brand">
            £{totalSpent.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-accent-bg border border-border-medium rounded-card">
            <span className="font-sans text-xs text-text-muted">Completed Orders</span>
            <p className="font-heading font-bold text-lg text-text-primary">
              {transactions.filter((t) => t.status === "completed").length}
            </p>
          </div>
          <div className="px-4 py-2 bg-accent-bg border border-border-medium rounded-card">
            <span className="font-sans text-xs text-text-muted">Total Records</span>
            <p className="font-heading font-bold text-lg text-text-primary">
              {transactions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-3 bg-surface p-4 rounded-card border border-border shadow-card">
        {["All", "Purchases", "Refunds"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-badge font-sans font-semibold text-[13px] transition-all cursor-pointer shadow-sm ${
              filter === tab
                ? "bg-primary border-primary text-white"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Transactions Data Table */}
      <div className="w-full bg-surface border border-border rounded-card p-6 overflow-x-auto shadow-card">
        <div className="min-w-[900px] flex flex-col">
          {/* Table Header Row */}
          <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border font-sans text-[11px] font-bold text-text-muted uppercase tracking-wider bg-accent-bg/50 pt-2 rounded-t-button">
            <div className="col-span-2 pl-4">Transaction ID</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-2 text-center">Payment Method</div>
            <div className="col-span-1 text-right pr-4">Status</div>
          </div>

          {/* Table Body Rows */}
          <div className="flex flex-col">
            {filteredTransactions.length === 0 ? (
              <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">💳</span>
                <p className="font-sans font-semibold text-sm text-text-primary">No transactions found</p>
                <p className="font-sans text-xs text-text-muted">
                  You have not made any purchases in this category yet.
                </p>
                <Link
                  href="/live-raffles"
                  className="mt-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-text rounded-button text-xs font-sans font-bold transition-all shadow-sm"
                >
                  Browse Competitions
                </Link>
              </div>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={`grid grid-cols-12 gap-4 py-4 items-center font-sans transition-colors hover:bg-accent-bg/30 ${
                    index !== filteredTransactions.length - 1 ? "border-b border-divider" : ""
                  }`}
                >
                  {/* Transaction ID */}
                  <div className="col-span-2 pl-4 font-semibold text-[13px] text-text-brand">
                    {transaction.transactionId}
                  </div>

                  {/* Date */}
                  <div className="col-span-2 font-medium text-[13px] text-text-muted">
                    {format(new Date(transaction.createdAt), "dd MMM yyyy")}
                  </div>

                  {/* Description */}
                  <div className="col-span-4 font-semibold text-[13px] text-text-primary truncate pr-4">
                    {transaction.raffleTitle
                      ? `Entry — ${transaction.raffleTitle}`
                      : transaction.type === "TICKET_PURCHASE"
                        ? "Ticket Purchase"
                        : transaction.type}
                  </div>

                  {/* Amount */}
                  <div className="col-span-1 font-bold text-[13px] text-text-primary">
                    £{Number(transaction.amount).toFixed(2)}
                  </div>

                  {/* Payment Method */}
                  <div className="col-span-2 text-center font-medium text-[13px] text-text-muted">
                    {transaction.paymentGateway || "Card"}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-end pr-4">
                    {transaction.status === "completed" && (
                      <div className="px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 shadow-sm">
                        <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">
                          Completed
                        </span>
                      </div>
                    )}
                    {transaction.status === "refunded" && (
                      <div className="px-3 py-1 rounded-badge border border-amber-200 bg-amber-50 shadow-sm">
                        <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">
                          Refunded
                        </span>
                      </div>
                    )}
                    {transaction.status === "failed" && (
                      <div className="px-3 py-1 rounded-badge border border-red-200 bg-red-50 shadow-sm">
                        <span className="text-[10px] font-semibold text-red-700 uppercase tracking-wide">
                          Failed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
