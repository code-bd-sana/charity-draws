import React from "react";
import { RaffleFormData } from "./CreateRaffleWizard";
import { cn } from "../../../../lib/utils";

interface Props {
  formData: RaffleFormData;
  updateForm: (data: Partial<RaffleFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CreateRaffleStep5({ formData, updateForm, onNext, onPrev }: Props) {
  return (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-heading font-bold text-xl md:text-2xl text-text-primary">
          Schedule & Rules
        </h2>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
          Determine when your raffle goes live and when the winner is drawn.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div className="flex flex-col gap-2">
            <label className="font-sans font-semibold text-xs md:text-sm text-text-primary">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => updateForm({ startDate: e.target.value })}
              className="h-11 px-4 bg-bg border border-border rounded-button font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-2">
            <label className="font-sans font-semibold text-xs md:text-sm text-text-primary">
              Draw Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => updateForm({ endDate: e.target.value })}
              className="h-11 px-4 bg-bg border border-border rounded-button font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-4 mt-4">
          {/* Draw Strategy: Manual vs Auto */}
          <div className="flex flex-col gap-4 p-5 bg-bg border border-border rounded-button shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-heading font-bold text-xs md:text-sm text-text-primary">
                  Draw Type
                </span>
                <span className="font-sans text-xs text-text-muted font-medium">
                  How will the winner be selected?
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-divider">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio"
                  name="drawType"
                  checked={!formData.isAutoDraw}
                  onChange={() => updateForm({ isAutoDraw: false, autoDrawDate: false, autoDrawSoldOut: false })}
                  className="mt-1 w-4 h-4 rounded-full border-border bg-surface text-primary focus:ring-primary accent-primary"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">
                    Live Draw
                  </span>
                  <span className="font-sans text-xs text-text-muted font-medium">
                    You will manually run the draw from your dashboard (e.g., live on Instagram).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio"
                  name="drawType"
                  checked={formData.isAutoDraw}
                  onChange={() => updateForm({ isAutoDraw: true, autoDrawDate: true, autoDrawSoldOut: true })}
                  className="mt-1 w-4 h-4 rounded-full border-border bg-surface text-primary focus:ring-primary accent-primary"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans font-semibold text-xs md:text-sm text-text-primary">
                    Automatic Draw
                  </span>
                  <span className="font-sans text-xs text-text-muted font-medium">
                    System automatically draws a winner when all tickets are sold out OR the end time expires.
                  </span>
                </div>
              </label>
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
          onClick={onNext}
          disabled={!formData.startDate || !formData.endDate}
          className="h-11 px-8 bg-primary hover:bg-primary-hover text-primary-text font-heading font-semibold text-xs md:text-sm transition-all rounded-button flex items-center justify-center shadow-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next Step &rarr;</span>
        </button>
      </div>
    </div>
  );
}
