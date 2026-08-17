import React from "react";
import { RaffleFormData } from "./CreateRaffleWizard";
import { cn } from "../../../../lib/utils";

interface Props {
  formData: RaffleFormData;
  onPrev: () => void;
  onPublish: () => void;
  isSubmitting?: boolean;
}

export default function CreateRaffleStep6({ formData, onPrev, onPublish, isSubmitting = false }: Props) {
  // Calculate potential earnings
  const tickets = parseInt(formData.totalTickets) || 0;
  const price = parseFloat(formData.ticketPrice) || 0;
  const gross = tickets * price;
  const platformFee = gross * 0.05; // 5% platform fee
  const net = gross - platformFee;

  return (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-heading font-bold text-xl md:text-2xl text-text-primary">
          Review & Publish
        </h2>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
          Review your raffle details carefully before making it live.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Basic Details Summary */}
        <div className="flex flex-col p-6 bg-bg border border-border rounded-card gap-4 shadow-sm">
          <h3 className="font-heading font-bold text-base text-text-primary border-b border-divider pb-2">
            Basic Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">Title</span>
              <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">{formData.title || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">Category</span>
              <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">{formData.category || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">Main Prize Value</span>
              <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">{formData.mainPrizeValue ? `£${formData.mainPrizeValue}` : "—"}</span>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">Description</span>
              <p className="font-sans font-medium text-xs md:text-sm text-text-primary whitespace-pre-wrap">{formData.description || "—"}</p>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="flex flex-col p-6 bg-bg border border-border rounded-card gap-4 shadow-sm">
          <h3 className="font-heading font-bold text-base text-text-primary border-b border-divider pb-2">
            Pricing & Projections
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">Tickets</span>
              <span className="font-sans font-bold text-sm md:text-base text-text-primary">{formData.totalTickets || "0"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">Price</span>
              <span className="font-sans font-bold text-sm md:text-base text-text-primary">£{price.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">Platform Fee</span>
              <span className="font-sans font-bold text-sm md:text-base text-red-600">-£{platformFee.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">Est. Earnings</span>
              <span className="font-heading font-bold text-lg md:text-xl text-text-brand">£{net.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Schedule Summary */}
        <div className="flex flex-col p-6 bg-bg border border-border rounded-card gap-4 shadow-sm">
          <h3 className="font-heading font-bold text-base text-text-primary border-b border-divider pb-2">
            Schedule & Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">Start Date</span>
              <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">
                {formData.startDate ? new Date(formData.startDate).toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">Draw Date</span>
              <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">
                {formData.endDate ? new Date(formData.endDate).toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-text-muted">Auto Draw</span>
              <span className={cn("font-sans font-bold text-xs md:text-sm", formData.isAutoDraw ? "text-text-brand" : "text-text-muted")}>
                {formData.isAutoDraw ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-divider">
        <button
          onClick={onPrev}
          className="h-11 px-6 bg-bg border border-border hover:bg-accent-bg/50 text-text-primary font-semibold text-xs md:text-sm transition-all rounded-button flex items-center justify-center cursor-pointer"
        >
          &larr; Back
        </button>
        <button
          onClick={onPublish}
          disabled={isSubmitting}
          className="h-11 px-8 bg-primary hover:bg-primary-hover text-primary-text font-heading font-bold text-xs md:text-sm transition-all rounded-button flex items-center gap-2 justify-center shadow-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isSubmitting ? "Publishing..." : "Publish Raffle"}</span>
          {!isSubmitting && (
            <svg className="w-4 h-4 text-primary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
