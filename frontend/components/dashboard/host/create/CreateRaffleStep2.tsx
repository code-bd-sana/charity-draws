import React from "react";
import { RaffleFormData } from "./CreateRaffleWizard";

interface Props {
  formData: RaffleFormData;
  updateForm: (data: Partial<RaffleFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CreateRaffleStep2({ formData, updateForm, onNext, onPrev }: Props) {
  const numTotalTickets = parseInt(formData.totalTickets, 10) || 0;
  const numTicketPrice = parseFloat(formData.ticketPrice) || 0;
  const numMinTickets = Math.max(1, parseInt(formData.minTickets, 10) || 1);
  const numMaxTickets = formData.maxTickets ? parseInt(formData.maxTickets, 10) : null;

  // Real-time Instant Validations:
  // 1. Minimum tickets cannot exceed total tickets available
  const minExceedsTotal = numTotalTickets > 0 && numMinTickets > numTotalTickets;
  
  // 2. Minimum tickets cannot be greater than maximum tickets (if set)
  const minExceedsMax = numMaxTickets !== null && numMaxTickets > 0 && numMinTickets > numMaxTickets;

  // 3. Maximum tickets cannot exceed total tickets available
  const maxExceedsTotal = numTotalTickets > 0 && numMaxTickets !== null && numMaxTickets > numTotalTickets;

  // 4. Maximum tickets cannot be less than minimum tickets
  const maxLessThanMin = numMaxTickets !== null && numMaxTickets > 0 && numMaxTickets < numMinTickets;

  const hasValidationError = minExceedsTotal || minExceedsMax || maxExceedsTotal || maxLessThanMin;
  const isStepValid = numTotalTickets > 0 && numTicketPrice > 0 && !hasValidationError;

  return (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-heading font-bold text-xl md:text-2xl text-text-primary">
          Tickets & Pricing
        </h2>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
          Set the parameters for your raffle tickets and expected revenue.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Main Prize Value */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-semibold text-xs md:text-sm text-text-primary">
            Main Prize Value (£)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans font-medium text-xs md:text-sm text-text-muted">
              £
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.mainPrizeValue}
              onChange={(e) => updateForm({ mainPrizeValue: e.target.value })}
              placeholder="e.g. 1500.00"
              className="w-full h-11 pl-8 pr-4 bg-bg border border-border rounded-button font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Total Tickets */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-semibold text-xs md:text-sm text-text-primary">
            Total Number of Tickets
          </label>
          <input
            type="number"
            value={formData.totalTickets}
            onChange={(e) => updateForm({ totalTickets: e.target.value })}
            placeholder="e.g. 500"
            className="h-11 px-4 bg-bg border border-border rounded-button font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Ticket Price */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-semibold text-xs md:text-sm text-text-primary">
            Ticket Price (£)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans font-medium text-xs md:text-sm text-text-muted">
              £
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.ticketPrice}
              onChange={(e) => updateForm({ ticketPrice: e.target.value })}
              placeholder="e.g. 2.50"
              className="w-full h-11 pl-8 pr-4 bg-bg border border-border rounded-button font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Minimum & Maximum Tickets Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-sans font-semibold text-xs md:text-sm text-text-primary">
              Minimum Tickets Per Order
            </label>
            <input
              type="number"
              min="1"
              max={numTotalTickets > 0 ? numTotalTickets : undefined}
              value={formData.minTickets}
              onChange={(e) => updateForm({ minTickets: e.target.value })}
              placeholder="e.g. 1"
              className={`h-11 px-4 bg-bg border rounded-button font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/70 outline-none transition-all ${
                minExceedsTotal || minExceedsMax
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
              }`}
            />
            {minExceedsTotal ? (
              <span className="font-sans text-[11px] text-red-500 font-semibold">
                ⚠️ Minimum tickets cannot exceed total tickets ({numTotalTickets}).
              </span>
            ) : minExceedsMax ? (
              <span className="font-sans text-[11px] text-red-500 font-semibold">
                ⚠️ Minimum tickets cannot be greater than maximum tickets ({numMaxTickets}).
              </span>
            ) : (
              <span className="font-sans text-[11px] text-text-muted font-medium">
                Minimum number of tickets a participant must buy per entry (default: 1).
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans font-semibold text-xs md:text-sm text-text-primary">
              Maximum Tickets Per Person (Optional)
            </label>
            <input
              type="number"
              min={numMinTickets}
              max={numTotalTickets > 0 ? numTotalTickets : undefined}
              value={formData.maxTickets}
              onChange={(e) => updateForm({ maxTickets: e.target.value })}
              placeholder="e.g. 50 (leave empty for unlimited)"
              className={`h-11 px-4 bg-bg border rounded-button font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/70 outline-none transition-all ${
                maxExceedsTotal || maxLessThanMin
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                  : "border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
              }`}
            />
            {maxExceedsTotal ? (
              <span className="font-sans text-[11px] text-red-500 font-semibold">
                ⚠️ Maximum tickets cannot exceed total competition tickets ({numTotalTickets}).
              </span>
            ) : maxLessThanMin ? (
              <span className="font-sans text-[11px] text-red-500 font-semibold">
                ⚠️ Maximum tickets cannot be less than minimum tickets ({numMinTickets}).
              </span>
            ) : (
              <span className="font-sans text-[11px] text-text-muted font-medium">
                Maximum number of tickets any single user can purchase in total.
              </span>
            )}
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
          onClick={onNext}
          disabled={!isStepValid}
          className="h-11 px-8 bg-primary hover:bg-primary-hover text-primary-text font-heading font-semibold text-xs md:text-sm transition-all rounded-button flex items-center justify-center shadow-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next Step &rarr;</span>
        </button>
      </div>
    </div>
  );
}
