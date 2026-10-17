"use client";

import React, { useState } from "react";
import AssignTicketsTab from "@/components/dashboard/admin/ticket-assignment/AssignTicketsTab";
import AssignmentHistoryTab from "@/components/dashboard/admin/ticket-assignment/AssignmentHistoryTab";
import { Ticket, History, ShieldCheck } from "lucide-react";

export default function AdminTicketAssignmentPage() {
  const [activeTab, setActiveTab] = useState<"assign" | "history">("assign");

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading font-bold text-2xl text-text-primary">
              Manual Ticket Assignment
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-badge bg-primary/10 border border-primary/30 text-text-brand font-bold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </span>
          </div>
          <p className="font-sans text-sm text-text-muted font-medium">
            Issue competition tickets directly to participants with 100% financial consistency, host wallet crediting, and instant win prize automation.
          </p>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center p-1 bg-surface border border-border rounded-badge shadow-card shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("assign")}
            className={`flex items-center gap-2 px-5 py-2 rounded-badge font-sans font-semibold text-xs transition-all cursor-pointer ${
              activeTab === "assign"
                ? "bg-primary text-primary-text shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Assign Tickets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-5 py-2 rounded-badge font-sans font-semibold text-xs transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-primary text-primary-text shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Assignment History</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "assign" ? (
        <AssignTicketsTab />
      ) : (
        <AssignmentHistoryTab />
      )}
    </div>
  );
}
