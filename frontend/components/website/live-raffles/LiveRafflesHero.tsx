"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { raffleService } from "../../../services/raffle.service";

interface LiveRafflesHeroProps {
  liveCount?: number;
  closingTodayCount?: number;
  totalPrizesValue?: string;
}

/**
 * Hero/Header section of the Live Raffles page.
 * Styled matching the homepage hero design system with badges, gradient heading, and metric cards.
 */
export default function LiveRafflesHero({
  liveCount: propLiveCount,
  closingTodayCount: propClosingTodayCount,
  totalPrizesValue: propTotalPrizesValue,
}: LiveRafflesHeroProps) {
  const [stats, setStats] = useState<{
    liveCount: number;
    closingTodayCount: number;
    totalPrizesValue: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await raffleService.getLiveRafflesStats();
        if (res) {
          setStats(res);
        }
      } catch (err) {
        console.error("Failed to fetch live raffles stats:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const liveCount = propLiveCount ?? stats?.liveCount ?? (isLoading ? "..." : 0);
  const closingTodayCount = propClosingTodayCount ?? stats?.closingTodayCount ?? (isLoading ? "..." : 0);
  const totalPrizesValue = propTotalPrizesValue ?? stats?.totalPrizesValue ?? (isLoading ? "..." : "£0");
  return (
    <section className="relative pt-12 md:pt-16 pb-10 border-b border-divider">
      <div className="container-custom relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-xs font-sans font-medium text-text-muted">
            <li>
              <Link href="/" className="hover:text-text-brand transition-colors duration-200">
                Home
              </Link>
            </li>
            <li className="text-border-medium" aria-hidden="true">
              /
            </li>
            <li className="text-text-brand select-none font-semibold">Live Competitions</li>
          </ol>
        </nav>

        {/* Hero Content Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center bg-accent-bg border border-border px-3 py-1.5 rounded-badge text-[11px] font-semibold uppercase tracking-wider text-text-brand mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
              LIVE & ACTIVE RAFFLES
            </div>

            {/* Main Title */}
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight mb-4 leading-tight">
              Win Premium{" "}
              <span className="text-text-brand bg-gradient-to-r from-primary to-[#8A46E4] bg-clip-text text-transparent">
                Live Competitions
              </span>
            </h1>

            {/* Subtitle */}
            <p className="font-sans text-sm md:text-base text-text-muted leading-relaxed max-w-xl">
              Browse every active draw. Filter by category, price, or closing time. Hosted by verified charity businesses with fast payouts.
            </p>
          </div>

          {/* Metric Cards (Floating right) */}
          <div className="grid grid-cols-3 sm:flex flex-wrap gap-3 shrink-0">
            <div className="flex flex-col items-center justify-center bg-surface border border-border px-5 py-3.5 rounded-card shadow-card hover:border-border-medium transition-all">
              <div className="flex items-center gap-1.5 text-text-brand font-heading font-bold text-xl md:text-2xl">
                <span className="w-2 h-2 rounded-full bg-success animate-ping" />
                <span>{liveCount}</span>
              </div>
              <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-0.5">
                Active Draws
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center bg-surface border border-border px-5 py-3.5 rounded-card shadow-card hover:border-border-medium transition-all">
              <div className="font-heading font-bold text-xl md:text-2xl text-text-primary">
                {closingTodayCount}
              </div>
              <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-0.5">
                Closing Today
              </span>
            </div>

            <div className="flex flex-col items-center justify-center bg-surface border border-border px-5 py-3.5 rounded-card shadow-card hover:border-border-medium transition-all">
              <div className="font-heading font-bold text-xl md:text-2xl text-text-brand">
                {totalPrizesValue}
              </div>
              <span className="font-sans text-[11px] font-semibold text-text-muted uppercase tracking-wider mt-0.5">
                In Prizes
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
