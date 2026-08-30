import React from "react";
import { cn } from "../../../lib/utils";

interface WinnersFilterBarProps {
  activeTab: "all" | "month" | "week";
  setActiveTab: (tab: "all" | "month" | "week") => void;
  sortBy: "newest" | "oldest";
  setSortBy: (sort: "newest" | "oldest") => void;
}

/**
 * Filter bar for Winners page.
 * Manages timeline capsule selections (All Time, This Month, This Week) and sort order.
 */
export default function WinnersFilterBar({
  activeTab,
  setActiveTab,
  sortBy,
  setSortBy,
}: WinnersFilterBarProps) {
  return (
    <div className="bg-surface/90 backdrop-blur-md border-y border-divider py-4 sticky top-[60px] md:top-[66px] z-30 shadow-sm select-none">
      <div className="container-custom flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Timeline Toggles */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2 rounded-badge border font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
              activeTab === "all"
                ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
                : "bg-surface border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
            )}
          >
            All Time
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={cn(
              "px-4 py-2 rounded-badge border font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
              activeTab === "month"
                ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
                : "bg-surface border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
            )}
          >
            This Month
          </button>
          <button
            onClick={() => setActiveTab("week")}
            className={cn(
              "px-4 py-2 rounded-badge border font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
              activeTab === "week"
                ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
                : "bg-surface border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
            )}
          >
            This Week
          </button>
        </div>

        {/* Sort Dropdown Selector */}
        <div className="relative w-full sm:w-48 font-sans">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
            className="w-full bg-surface border border-border text-text-primary rounded-button px-4 py-2.5 font-sans text-xs font-semibold hover:border-border-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer outline-none appearance-none shadow-sm"
            aria-label="Sort Winner Records"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          
          {/* Custom Select Chevron Icon */}
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
