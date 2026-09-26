"use client";

import React, { useState } from "react";
import FreePostalEntryModal from "./FreePostalEntryModal";
import { cn } from "../../../lib/utils";

interface FreePostalEntryButtonProps {
  raffleTitle?: string;
  variant?: "badge" | "button" | "card";
  className?: string;
}

export default function FreePostalEntryButton({
  raffleTitle,
  variant = "badge",
  className,
}: FreePostalEntryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === "badge" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] border border-[#D8B4FE] text-[#7131C8] font-sans font-bold text-[11px] hover:bg-[#EDE9FE] transition-all cursor-pointer select-none",
            className
          )}
        >
          <span className="text-xs">✉️</span>
          <span>Free Postal Entry</span>
        </button>
      )}

      {variant === "button" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-full h-11 px-4 rounded-xl bg-white border border-[#D8B4FE] text-[#7131C8] font-heading font-semibold text-xs sm:text-sm hover:bg-[#F9F5FF] hover:border-[#7131C8] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs",
            className
          )}
        >
          <span className="text-sm">✉️</span>
          <span>Enter for Free by Post</span>
        </button>
      )}

      {variant === "card" && (
        <div
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-full bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#F3E8FF] transition-all shadow-sm group",
            className
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#D8B4FE] flex items-center justify-center text-xl shrink-0">
              ✉️
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs text-[#2E0B57] group-hover:text-[#7131C8] transition-colors">
                Free Postal Entry Route (UK Law)
              </h4>
              <p className="font-sans text-[11px] text-[#6B7280]">
                Equal free entry available on an unenclosed postcard.
              </p>
            </div>
          </div>
          <span className="font-sans font-bold text-xs text-[#7131C8] underline group-hover:translate-x-0.5 transition-transform shrink-0">
            View Rules &rarr;
          </span>
        </div>
      )}

      <FreePostalEntryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        raffleTitle={raffleTitle}
      />
    </>
  );
}
