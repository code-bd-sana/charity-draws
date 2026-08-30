"use client";

import React, { useState } from "react";
import DrawOverviewTab from "./DrawOverviewTab";
import DrawEntriesTab from "./DrawEntriesTab";
import DrawAuditLogTab from "./DrawAuditLogTab";
import { format } from "date-fns";
import { Raffle } from "../../../../services/raffle.service";

import ManualWinnerSelectModal from "../../shared/ManualWinnerSelectModal";

interface DrawDetailsPanelProps {
  draw: Raffle;
  onClose: () => void;
}

export default function DrawDetailsPanel({ draw, onClose }: DrawDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "entries" | "audit">("overview");
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);

  const getStatusString = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL": return "Pending Approval";
      case "DRAFT": return "Draft";
      case "ENDED": return "Completed";
      case "ACTIVE": return "In Progress";
      case "CANCELLED": return "Cancelled";
      default: return status;
    }
  };

  const getDrawType = (d: Raffle) => {
    if (!d.isAutoDraw) return "Manual (Host)";
    if (d.isAutoDraw && d.autoDrawSoldOut) return "Auto (Sold Out)";
    return "Auto (Date)";
  };

  const hostName = draw.host?.businessName || "Unknown Host";
  const statusString = getStatusString(draw.status);
  const drawType = getDrawType(draw);
  const scheduledTime = draw.endDate ? format(new Date(draw.endDate), "dd MMM yyyy HH:mm") : "N/A";

  return (
    <div className="w-full bg-surface border border-border rounded-card flex flex-col mt-6 animate-fadeIn overflow-hidden shadow-card select-none">
      
      {/* Header Area */}
      <div className="flex flex-col p-6 pb-0 border-b border-border">
        
        {/* Title & Actions */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-heading font-bold text-[20px] text-text-primary">{draw.title}</h2>
            {/* Status Pills */}
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-badge border border-amber-200 bg-amber-50 text-amber-700 font-sans font-semibold text-[10px] shadow-sm">
                {statusString}
              </span>
              <span className="px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-[10px] shadow-sm">
                {drawType}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(() => {
              const hasWinner = Boolean(
                (draw as any).winners?.some((w: any) => w.winType === 'MAIN_DRAW')
              );
              const isSoldOut = (draw.ticketsSold || 0) >= (draw.totalTickets || 1);
              const isExpired = draw.endDate ? new Date(draw.endDate) <= new Date() : false;
              const canDraw = !hasWinner && (isSoldOut || isExpired);

              if (hasWinner) {
                return (
                  <span className="px-3.5 py-1.5 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-xs flex items-center gap-1.5 shadow-sm">
                    <span>✓</span> Winner Selected
                  </span>
                );
              }

              if (canDraw) {
                return (
                  <button
                    onClick={() => setIsWinnerModalOpen(true)}
                    className="px-4 py-2 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🏆</span>
                    <span>Select Winner</span>
                  </button>
                );
              }

              return (
                <span className="px-3 py-1.5 rounded-badge border border-border bg-bg text-text-muted font-sans font-medium text-xs">
                  Live (In Progress)
                </span>
              );
            })()}
            <button 
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <div className="font-sans text-[12px] text-text-muted font-medium mb-8">
          Host: <span className="text-text-primary font-semibold">{hostName}</span> | End Date: <span className="text-text-primary font-semibold">{scheduledTime}</span>
        </div>

        {/* 4 Stat Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-bg border border-border rounded-button p-4 flex flex-col gap-1">
            <span className="font-sans text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Tickets</span>
            <span className="font-heading font-bold text-[20px] text-text-primary">{draw.totalTickets}</span>
          </div>
          <div className="bg-bg border border-border rounded-button p-4 flex flex-col gap-1">
            <span className="font-sans text-[10px] font-semibold text-text-muted uppercase tracking-wider">Sold Tickets</span>
            <span className="font-heading font-bold text-[20px] text-emerald-700">{draw.ticketsSold || 0}</span>
          </div>
          <div className="bg-bg border border-border rounded-button p-4 flex flex-col gap-1">
            <span className="font-sans text-[10px] font-semibold text-text-muted uppercase tracking-wider">Price Per Ticket</span>
            <span className="font-heading font-bold text-[20px] text-text-primary">£{Number(draw.pricePerTicket).toFixed(2)}</span>
          </div>
          <div className="bg-bg border border-border rounded-button p-4 flex flex-col gap-1">
            <span className="font-sans text-[10px] font-semibold text-text-muted uppercase tracking-wider">Draw Type</span>
            <span className="font-heading font-bold text-[20px] text-text-brand">{drawType}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 h-[40px] rounded-button font-sans font-semibold text-[13px] transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-primary border-primary text-white shadow-sm"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("entries")}
            className={`flex-1 h-[40px] rounded-button font-sans font-semibold text-[13px] transition-all cursor-pointer ${
              activeTab === "entries"
                ? "bg-primary border-primary text-white shadow-sm"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
            }`}
          >
            Entries
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex-1 h-[40px] rounded-button font-sans font-semibold text-[13px] transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-primary border-primary text-white shadow-sm"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
            }`}
          >
            Audit Log
          </button>
        </div>

      </div>

      {/* Tab Content Area */}
      <div className="p-6">
        {activeTab === "overview" && <DrawOverviewTab />}
        {activeTab === "entries" && <DrawEntriesTab />}
        {activeTab === "audit" && <DrawAuditLogTab />}
      </div>

      {isWinnerModalOpen && (
        <ManualWinnerSelectModal
          isOpen={isWinnerModalOpen}
          onClose={() => setIsWinnerModalOpen(false)}
          raffle={draw}
          isAdmin={true}
        />
      )}

    </div>
  );
}
