import React from "react";
import { RaffleFormData } from "./CreateRaffleWizard";

interface Props {
  formData: RaffleFormData;
  updateForm: (data: Partial<RaffleFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CreateRaffleStep2({ formData, updateForm, onNext, onPrev }: Props) {
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

        {/* Minimum Tickets */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-semibold text-xs md:text-sm text-text-primary">
            Minimum Tickets Per Person (Optional)
          </label>
          <input
            type="number"
            value={formData.minTickets}
            onChange={(e) => updateForm({ minTickets: e.target.value })}
            placeholder="e.g. 1"
            className="h-11 px-4 bg-bg border border-border rounded-button font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
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
          disabled={!formData.totalTickets || !formData.ticketPrice}
          className="h-11 px-8 bg-primary hover:bg-primary-hover text-primary-text font-heading font-semibold text-xs md:text-sm transition-all rounded-button flex items-center justify-center shadow-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next Step &rarr;</span>
        </button>
      </div>
    </div>
  );
}
