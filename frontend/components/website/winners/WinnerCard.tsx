import React from "react";
import Image from "next/image";
import { Winner } from "../../../types/winner.types";

interface WinnerCardProps {
  winner: Winner;
}

/**
 * Renders a completed raffle winner record card with ticket and avatar details.
 */
export default function WinnerCard({ winner }: WinnerCardProps) {
  const { name, location, avatar, competitionImage, initials, prizeTitle, drawDate, ticketNumber } = winner;
  const displayImage = competitionImage || avatar;

  return (
    <div className="relative bg-surface border border-border rounded-card p-5 hover:border-border-medium hover:shadow-glow transition-all duration-300 w-full min-h-[185px] shadow-card group">
      
      {/* Top Header Block: Initials & User Details */}
      <div className="flex items-center gap-3 pr-24">
        {/* Initials Placeholder Circle */}
        <div className="w-11 h-11 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center font-sans font-bold text-sm text-text-brand select-none shrink-0 shadow-sm">
          {initials}
        </div>

        {/* Name & Location Details */}
        <div className="flex flex-col min-w-0">
          <span className="font-sans font-semibold text-sm text-text-primary group-hover:text-text-brand transition-colors duration-200 truncate">
            {name}
          </span>
          {location && location !== "Unknown Location" && location !== "Unknown" && (
            <span className="font-sans text-xs text-text-muted truncate mt-0.5 font-medium">
              {location}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="h-px bg-divider w-full my-4" />

      {/* Body Section: Prize Name & Draw Date */}
      <div className="flex flex-col justify-between pr-24">
        <div>
          <h3 className="font-heading font-bold text-sm text-text-primary line-clamp-1 leading-snug">
            {prizeTitle}
          </h3>
          <p className="font-sans text-[11px] text-text-muted mt-1 leading-normal">
            {drawDate}
          </p>
        </div>
      </div>

      {/* Bottom Row: Delivered status pill & ticket ref */}
      <div className="flex items-center justify-between mt-4 pr-24 sm:pr-0">
        {/* Verification Status Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 flex items-center gap-1.5 w-fit shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 leading-none">
            ✓
          </span>
          <span className="text-[10px] font-bold text-emerald-700 leading-none uppercase tracking-wider">
            Delivered
          </span>
        </div>

        {/* Masked Ticket Reference Number (For transparency) */}
        <span className="font-sans text-[10px] text-text-brand bg-accent-bg/60 border border-border/50 px-2 py-0.5 rounded-badge tracking-wider font-semibold mr-1">
          {ticketNumber}
        </span>
      </div>

      {/* Competition/Prize photo (Absolute positioning on the top-right corner) */}
      {displayImage && (
        <div className="absolute right-5 top-5 w-20 h-20 rounded-button border border-border overflow-hidden bg-bg shrink-0 shadow-sm select-none group-hover:border-border-medium transition-all">
          <Image
            src={displayImage}
            alt={`${prizeTitle} prize image`}
            fill
            sizes="80px"
            className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </div>
      )}

    </div>
  );
}
