"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Draw } from "../../../types/draw.types";
import { formatCurrency } from "../../../lib/utils";
import { cn } from "../../../lib/utils";

interface LiveRaffleCardProps {
  raffle: Draw;
  viewMode?: "grid" | "list";
}

/**
 * Dedicated Card component for the Live Raffles page and Related Raffles section.
 * Styled matching the homepage design system tokens.
 */
export default function LiveRaffleCard({ raffle, viewMode = "grid" }: LiveRaffleCardProps) {
  const r = raffle as any;

  const id = r.id;
  const title = r.title || "Untitled Competition";
  const slug = r.slug || id;
  const isAutoDraw = r.isAutoDraw;
  const host = r.host;

  const fallbackImg = "https://placehold.co/800x600/F4EEFF/7131C8?text=No+Image";
  const image = r.mainImage || r.image || fallbackImg;

  const ticketPrice = Number(r.pricePerTicket ?? r.ticketPrice ?? 0) || 0;
  const totalTickets = Number(r.totalTickets ?? 0) || 0;
  const soldTickets = Number(r.ticketsSold ?? r.soldTickets ?? 0) || 0;

  const worthPrice = Number(r.worthPrice ?? (ticketPrice * totalTickets)) || 0;
  const soldPercent = totalTickets > 0 ? Math.min(Math.round((soldTickets / totalTickets) * 100), 100) : 0;
  const badgeText = r.badgeText || (soldPercent >= 90 ? "ALMOST GONE" : "HOT");

  const category = r.category || "rifles";

  const hostName = host?.businessName || (host?.user?.firstName ? `${host.user.firstName} ${host.user.lastName || ''}`.trim() : "");
  const hostLocation = host?.user?.location || host?.address || "";

  const rawEndDate = r.endDate;
  const isValidDate = rawEndDate && !isNaN(new Date(rawEndDate).getTime());
  const formattedEndDate = isValidDate
    ? new Date(rawEndDate).toLocaleDateString()
    : (typeof rawEndDate === "string" ? rawEndDate : "Closing Soon");

  const [timeLeft, setTimeLeft] = useState<string>(() => {
    if (!isValidDate) return typeof rawEndDate === "string" ? rawEndDate : "Closing Soon";
    return "";
  });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!isValidDate) {
      if (typeof rawEndDate === "string") setTimeLeft(rawEndDate);
      return;
    }

    const calculateTime = () => {
      const diff = new Date(rawEndDate).getTime() - new Date().getTime();
      if (diff <= 0) return "Ended";
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      if (d > 0) return `${d}d ${h}h ${m}m`;
      return `${h}h ${m}m ${s}s`;
    };
    
    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [rawEndDate, isValidDate]);

  // SVG Icons
  const fireIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5 text-amber-500"
    >
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-3.66-2.61-6.72-6.07-7.39.37.76.57 1.62.57 2.53 0 1.95-1.07 3.65-2.67 4.54l-.06.03c.53-2.14-.17-4.47-1.78-6.1l-.32-.33c-.09.33-.14.67-.14 1.02 0 2.27 1.34 4.22 3.28 5.11l.08.04c-1.61-.31-3.23.36-4.13 1.73A7.514 7.514 0 0 0 7 17.5c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-1.65-.54-3.18-1.57-4.52z" />
    </svg>
  );

  const ticketIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-3.5 h-3.5 text-text-brand"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h12c.621 0 1.125.504 1.125 1.125v1.757a1.5 1.5 0 0 0 0 2.236v1.757a1.5 1.5 0 0 0 0 2.236v1.757a1.5 1.5 0 0 0-1.125 1.125H7.5a1.125 1.125 0 0 1-1.125-1.125v-1.757a1.5 1.5 0 0 0 0-2.236V11.23a1.5 1.5 0 0 0 0-2.236V7.125A1.125 1.125 0 0 1 7.5 6Z"
      />
    </svg>
  );

  const clockIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-3.5 h-3.5 text-text-muted"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );

  // Status badge styling helper using homepage palette
  const getBadgeStyle = (text: string) => {
    switch (text.toUpperCase()) {
      case "ALMOST GONE":
        return "bg-amber-100 border-amber-300 text-amber-800 font-semibold";
      case "HOT":
        return "bg-rose-100 border-rose-300 text-rose-800 font-semibold";
      case "NEW":
        return "bg-emerald-100 border-emerald-300 text-emerald-800 font-semibold";
      case "EXCLUSIVE":
        return "bg-accent-bg border-border text-text-brand font-semibold";
      default:
        return "bg-accent-bg border-border text-text-muted font-medium";
    }
  };

  // Human readable category mapping
  const categoryLabels: Record<string, string> = {
    rifles: "Rifles",
    pistols: "Pistols",
    snipers: "Snipers",
    accessories: "Accessories",
    apparel: "Apparel",
    cash: "Cash Prizes",
    bundles: "Bundles",
    luxury: "Luxury",
  };

  const categoryLabel = categoryLabels[category] || category;

  if (viewMode === "list") {
    return (
      <div className="flex flex-col sm:flex-row bg-surface border border-border rounded-card overflow-hidden shadow-card transition-all duration-300 hover:border-border-medium hover:shadow-glow w-full group">
        {/* Left Side: Image Block */}
        <div className="relative w-full sm:w-[240px] md:w-[280px] h-[180px] sm:h-auto bg-bg shrink-0">
          <Image
            src={imgError ? fallbackImg : image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 280px"
            className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
            unoptimized
            onError={() => setImgError(true)}
          />

          {/* Badges on Top of Image */}
          <div className="absolute inset-x-3 top-3 flex items-start justify-between pointer-events-none z-10">
            {(hostName || hostLocation) ? (
              <div className="bg-surface/90 backdrop-blur-md border border-border-medium px-2.5 py-1 rounded-badge text-[10px] font-semibold text-text-brand shadow-sm truncate max-w-[160px]">
                {hostLocation ? `📍 ${hostLocation}` : `By ${hostName}`}
              </div>
            ) : <div />}

            <div className="bg-accent-bg/90 backdrop-blur-md border border-border px-2.5 py-1 rounded-badge text-[10px] font-semibold text-text-brand shadow-sm">
              {categoryLabel}
            </div>
          </div>
          
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-center pointer-events-none z-10">
            <div className="bg-surface/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-badge flex items-center gap-1.5 shadow-sm">
              {clockIcon}
              <span className="text-[11px] font-bold text-text-primary tracking-wide">{timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Details Content */}
        <div className="flex-grow p-5 md:p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            {/* Title & Price Row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-lg md:text-xl text-text-primary group-hover:text-text-brand transition-colors duration-200">
                  {title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {badgeText && (
                    <div className={cn("inline-flex items-center gap-1 border px-2 py-0.5 rounded-badge text-[9px] tracking-wider", getBadgeStyle(badgeText))}>
                      {badgeText.toUpperCase() === "ALMOST GONE" && fireIcon}
                      <span>{badgeText}</span>
                    </div>
                  )}
                  {isAutoDraw && (
                    <div className="inline-flex items-center gap-1 border border-border bg-accent-bg px-2 py-0.5 rounded-badge text-[9px] font-semibold text-text-brand tracking-wider">
                      AUTO DRAW
                    </div>
                  )}
                </div>
                {worthPrice > 0 && (
                  <p className="font-sans text-xs text-text-secondary font-semibold mt-1.5">
                    Worth {formatCurrency(worthPrice, 0)}
                  </p>
                )}
              </div>
              <div className="bg-accent-bg border border-border px-3 py-1 rounded-badge text-sm font-bold font-heading text-text-brand shrink-0 shadow-sm">
                {formatCurrency(ticketPrice)}
              </div>
            </div>
          </div>

          {/* Middle: Progress Bar & Countdown Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 pt-4 border-t border-divider">
            {/* Progress block */}
            <div className="flex flex-col justify-center">
              <div className="flex justify-between items-center text-[11px] text-text-muted mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  {ticketIcon}
                  <span>{soldTickets} / {totalTickets} sold</span>
                </span>
                <span className="text-text-brand font-semibold">{soldPercent}%</span>
              </div>
              <div className="w-full h-2 bg-bg rounded-badge overflow-hidden border border-divider">
                <div
                  className="h-full bg-primary rounded-badge transition-all duration-500 ease-out"
                  style={{ width: `${soldPercent}%` }}
                />
              </div>
            </div>

            {/* Countdown block */}
            <div className="flex items-center gap-2 bg-accent-bg/40 border border-border/70 px-3.5 py-2 rounded-button w-full">
              {clockIcon}
              <div className="flex gap-1 text-xs">
                <span className="text-text-muted">Closes on</span>
                <span className="font-semibold text-text-primary">{formattedEndDate}</span>
              </div>
            </div>
          </div>

          {/* Bottom: CTA */}
          <div className="pt-2">
            <Link
              href={`/live-raffles/${slug || id}`}
              className="block w-full bg-gradient-to-r from-primary to-[#8A46E4] text-white hover:opacity-95 text-center py-2.5 rounded-button font-heading text-xs font-semibold tracking-wider transition-all duration-200 shadow-[0_4px_16px_rgba(113,49,200,0.25)] select-none uppercase"
            >
              Enter Draw →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default Grid Layout Card
  return (
    <div className="flex flex-col bg-surface border border-border rounded-card overflow-hidden shadow-card transition-all duration-300 hover:border-border-medium hover:shadow-glow w-full group">
      {/* Card Image Block */}
      <div className="relative w-full h-[200px] bg-bg shrink-0 overflow-hidden">
        <Image
          src={imgError ? fallbackImg : image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
          unoptimized
          onError={() => setImgError(true)}
        />

        {/* Floating Badges */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between pointer-events-none z-10">
          {(hostName || hostLocation) ? (
            <div className="bg-surface/90 backdrop-blur-md border border-border-medium px-2.5 py-1 rounded-badge text-[10px] font-semibold text-text-brand shadow-sm truncate max-w-[160px]">
              {hostLocation ? `📍 ${hostLocation}` : `By ${hostName}`}
            </div>
          ) : <div />}

          <div className="bg-accent-bg/90 backdrop-blur-md border border-border px-2.5 py-1 rounded-badge text-[10px] font-semibold text-text-brand shadow-sm">
            {categoryLabel}
          </div>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-center pointer-events-none z-10">
          <div className="bg-surface/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-badge flex items-center gap-1.5 shadow-sm">
            {clockIcon}
            <span className="text-[11px] font-bold text-text-primary tracking-wide">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Card Content details */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Header Row: Title & Price Tag */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-heading font-bold text-lg text-text-primary group-hover:text-text-brand transition-colors duration-200 line-clamp-1">
              {title}
            </h3>
            <div className="bg-accent-bg border border-border px-2.5 py-0.5 rounded-badge text-xs font-bold font-heading text-text-brand shrink-0 shadow-sm">
              {formatCurrency(ticketPrice)}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {badgeText && (
              <div className={cn("inline-flex items-center gap-1 border px-2 py-0.5 rounded-badge text-[9px] tracking-wider", getBadgeStyle(badgeText))}>
                {badgeText.toUpperCase() === "ALMOST GONE" && fireIcon}
                <span>{badgeText}</span>
              </div>
            )}
            {isAutoDraw && (
              <div className="inline-flex items-center gap-1 border border-border bg-accent-bg px-2 py-0.5 rounded-badge text-[9px] font-semibold text-text-brand tracking-wider">
                AUTO DRAW
              </div>
            )}
          </div>

          {/* Worth Subheading */}
          {worthPrice > 0 && (
            <p className="font-sans text-xs text-text-secondary font-semibold mb-3">
              Worth {formatCurrency(worthPrice, 0)}
            </p>
          )}

          {/* Ticket Sold Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-[10px] text-text-muted mb-1.5 font-medium">
              <span className="flex items-center gap-1">
                {ticketIcon}
                <span>{soldTickets} / {totalTickets} sold</span>
              </span>
              <span className="text-text-brand font-semibold">{soldPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-bg rounded-badge overflow-hidden border border-divider">
              <div
                className="h-full bg-primary rounded-badge transition-all duration-500 ease-out"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
          </div>

          {/* Closes in Countdown Block */}
          <div className="flex items-center gap-1.5 bg-accent-bg/40 border border-border/70 px-3 py-2 rounded-button mb-4 text-xs">
            {clockIcon}
            <span className="text-text-muted">Closes on</span>
            <span className="font-semibold text-text-primary">{formattedEndDate}</span>
          </div>
        </div>

        {/* Enter Draw CTA Button */}
        <Link
          href={`/live-raffles/${slug || id}`}
          className="block w-full bg-gradient-to-r from-primary to-[#8A46E4] text-white hover:opacity-95 text-center py-2.5 rounded-button font-heading text-xs font-semibold tracking-wider transition-all duration-200 shadow-[0_4px_16px_rgba(113,49,200,0.25)] select-none uppercase"
        >
          Enter Draw →
        </Link>
      </div>
    </div>
  );
}
