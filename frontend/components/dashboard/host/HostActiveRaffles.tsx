"use client";

import React from "react";
import { useHostRaffles } from "../../../hooks/useRaffleHooks";
import Link from "next/link";

interface HostActiveRafflesProps {
  raffles?: any[];
  isLoading?: boolean;
}

export default function HostActiveRaffles({ raffles, isLoading: propIsLoading }: HostActiveRafflesProps) {
  const { data: response, isLoading: queryIsLoading } = useHostRaffles({ limit: 5, status: "Live" });
  const activeRaffles = raffles ?? (response?.data || []);
  const isLoading = propIsLoading ?? queryIsLoading;

  return (
    <div className="bg-surface border border-border rounded-card p-6 w-full flex flex-col min-h-[330px] shadow-card select-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-base md:text-lg text-text-primary">
          Active Raffles
        </h2>
        <Link href="/dashboard/host/competitions" className="text-primary font-sans font-bold text-xs hover:underline flex items-center">
          View All <span className="ml-1">&rarr;</span>
        </Link>
      </div>

      <div className="flex flex-col w-full">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 h-12 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-accent-bg shrink-0"></div>
                <div className="flex-1 h-3.5 bg-accent-bg rounded"></div>
                <div className="w-12 h-3.5 bg-accent-bg rounded shrink-0"></div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && activeRaffles.length === 0 && (
          <div className="py-8 text-center text-text-muted font-sans text-xs md:text-sm font-medium">
            No active raffles found.
          </div>
        )}

        {!isLoading && activeRaffles.map((comp: any) => {
          const progress = Math.min(Math.round((comp.ticketsSold / comp.totalTickets) * 100), 100);
          const isEndingSoon = false; // Add logic if needed, e.g., less than 24h left
          const imageUrl = comp.images && comp.images.length > 0 ? comp.images[0] : "https://placehold.co/100x100/F0E5FF/7131C8?text=Raffle";

          return (
            <Link 
              href={`/dashboard/host/competitions`}
              key={comp.id} 
              className="flex items-center gap-3 py-3 border-b border-divider last:border-0 hover:bg-accent-bg/40 px-2 -mx-2 rounded-lg transition-colors cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-accent-bg border border-border-medium shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={comp.title} className="w-full h-full object-cover" />
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-xs md:text-sm text-text-primary truncate">
                  {comp.title}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-16 h-1.5 bg-accent-bg rounded-full overflow-hidden shrink-0 hidden sm:block">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${progress}%` }} 
                />
              </div>

              {/* Price */}
              <div className="w-14 shrink-0 text-right">
                <p className="font-sans font-bold text-xs md:text-sm text-text-brand">
                  £{Number(comp.pricePerTicket || 0).toFixed(2)}
                </p>
              </div>

              {/* Status Pill */}
              <div className={`px-2.5 py-0.5 rounded-badge flex items-center justify-center shrink-0 border shadow-sm ${
                isEndingSoon ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}>
                <span className="font-sans font-bold text-[11px]">
                  {isEndingSoon ? "Ending Soon" : "Live"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
