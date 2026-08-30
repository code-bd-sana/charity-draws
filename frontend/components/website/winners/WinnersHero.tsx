"use client";

import React, { useEffect, useState } from "react";
import { raffleService } from "../../../services/raffle.service";

/**
 * Renders the hero block for the Winners page, including transparency key statistics.
 */
export default function WinnersHero() {
  const [stats, setStats] = useState({
    prizesAwarded: "£0",
    totalWinners: 0,
    verifiedDraws: "0",
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await raffleService.getPublicWinnerStats();
        if (data) setStats(data);
      } catch (error) {
        console.error("Failed to load winner stats", error);
      }
    }
    loadStats();
  }, []);

  return (
    <section className="relative pt-12 md:pt-16 pb-12 border-b border-divider select-none">
      <div className="container-custom flex flex-col items-center text-center relative z-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center bg-accent-bg border border-border px-3.5 py-1.5 rounded-badge text-[11px] font-semibold uppercase tracking-wider text-text-brand mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
          COMMUNITY & TRANSPARENCY
        </div>

        {/* Page Heading */}
        <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-text-primary tracking-tight leading-tight">
          Real Winners,{" "}
          <span className="text-text-brand bg-gradient-to-r from-primary to-[#8A46E4] bg-clip-text text-transparent">
            Real Prizes
          </span>
        </h1>
        <p className="font-sans text-sm sm:text-base md:text-lg text-text-muted max-w-2xl mt-4 leading-relaxed font-medium">
          Browse every verified winner drawing. Every draw is transparent, audited, and delivered with fast host payouts.
        </p>

        {/* Transparency Stat Box */}
        <div className="mt-10 w-full max-w-4xl bg-surface border border-border rounded-card p-6 md:p-8 flex flex-col md:flex-row justify-around items-center gap-8 md:gap-4 shadow-card hover:border-border-medium transition-all">
          
          {/* Stat 1: Prizes Awarded */}
          <div className="flex flex-col items-center text-center flex-1">
            <span className="font-heading font-bold text-3xl md:text-4xl text-text-brand">
              {stats.prizesAwarded}
            </span>
            <span className="font-sans text-xs text-text-muted mt-2 font-semibold uppercase tracking-wider">
              Prizes Awarded
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-12 w-px bg-divider" />

          {/* Stat 2: Total Winners */}
          <div className="flex flex-col items-center text-center flex-1">
            <span className="font-heading font-bold text-3xl md:text-4xl text-text-brand">
              {stats.totalWinners.toLocaleString()}
            </span>
            <span className="font-sans text-xs text-text-muted mt-2 font-semibold uppercase tracking-wider">
              Total Winners
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-12 w-px bg-divider" />

          {/* Stat 3: Verified Draws */}
          <div className="flex flex-col items-center text-center flex-1">
            <span className="font-heading font-bold text-3xl md:text-4xl text-text-brand">
              {stats.verifiedDraws}
            </span>
            <span className="font-sans text-xs text-text-muted mt-2 font-semibold uppercase tracking-wider">
              Verified Draws
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
