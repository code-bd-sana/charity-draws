"use client";

import React from "react";
import { useHostRaffles } from "../../../hooks/useRaffleHooks";
import Link from "next/link";

interface HostUpcomingDrawsProps {
  draws?: any[];
  isLoading?: boolean;
}

export default function HostUpcomingDraws({ draws, isLoading: propIsLoading }: HostUpcomingDrawsProps) {
  const { data: response, isLoading: queryIsLoading } = useHostRaffles({ limit: 10, status: "Live" });
  
  const upcomingDraws = draws ?? (response?.data || [])
    .sort((a: any, b: any) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5);

  const isLoading = propIsLoading ?? queryIsLoading;

  return (
    <div className="bg-surface border border-border rounded-card p-6 w-full flex flex-col min-h-[330px] shadow-card select-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-base md:text-lg text-text-primary">
          Upcoming Draws
        </h2>
        <Link href="/dashboard/host/winners" className="text-primary font-sans font-bold text-xs hover:underline flex items-center">
          View All <span className="ml-1">&rarr;</span>
        </Link>
      </div>

      <div className="flex flex-col w-full gap-3">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-accent-bg shrink-0"></div>
                <div className="flex flex-col flex-1 gap-2">
                  <div className="h-3 bg-accent-bg rounded w-3/4"></div>
                  <div className="h-2.5 bg-accent-bg rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && upcomingDraws.length === 0 && (
          <div className="py-8 text-center text-text-muted font-sans text-xs md:text-sm font-medium">
            No upcoming draws found.
          </div>
        )}

        {!isLoading && upcomingDraws.map((draw: any) => {
          const dateObj = new Date(draw.endDate);
          const dayNumber = dateObj.getDate();
          
          return (
            <Link 
              href="/dashboard/host/winners"
              key={draw.id} 
              className="flex items-center gap-3 hover:bg-accent-bg/40 p-2 -mx-2 rounded-lg transition-colors cursor-pointer"
            >
              {/* Date Badge */}
              <div className="w-9 h-9 rounded-lg border border-border-medium bg-accent-bg flex items-center justify-center shrink-0">
                <span className="font-heading font-bold text-sm text-text-brand">
                  {dayNumber}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 min-w-0">
                <p className="font-heading font-semibold text-xs md:text-sm text-text-primary truncate">
                  {draw.title}
                </p>
                <p className="font-sans text-xs text-text-muted font-medium truncate">
                  {draw.ticketsSold} / {draw.totalTickets} tickets sold &bull; Ends {dateObj.toLocaleDateString()}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
