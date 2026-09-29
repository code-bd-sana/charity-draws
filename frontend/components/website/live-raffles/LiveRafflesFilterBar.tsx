"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { usePublicCategories } from "../../../hooks/useCategoryHooks";

interface LiveRafflesFilterBarProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

/**
 * Interactive filter, search, sort, and layout control bar for live raffles.
 * Fully responsive: prevents horizontal layout overflow by allowing category pills to scroll internally.
 */
export default function LiveRafflesFilterBar({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}: LiveRafflesFilterBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const { data: dbCategories = [] } = usePublicCategories();

  const categories = [
    { label: "All", value: "all" },
    ...dbCategories.map((c) => ({
      label: c.name,
      value: c.slug,
    })),
  ];

  const isCatActive = (catValue: string) => {
    if (activeCategory === catValue) return true;
    if (catValue === "all" && (!activeCategory || activeCategory === "all")) return true;
    const matched = dbCategories.find((c) => c.slug === catValue);
    if (
      matched &&
      (activeCategory.toLowerCase() === matched.name.toLowerCase() ||
        activeCategory.toLowerCase() === matched.slug.toLowerCase())
    ) {
      return true;
    }
    return false;
  };

  const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Ending Soon", value: "ending-soon" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Most Popular", value: "popular" },
  ];

  const activeSortOption = sortOptions.find((opt) => opt.value === sortBy) || sortOptions[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Category horizontal scroll detection
  const checkScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScrollState();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollState);
    }
    window.addEventListener("resize", checkScrollState);
    return () => {
      if (el) el.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [dbCategories]);

  const scrollCategoryPills = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -240 : 240;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="w-full bg-surface/90 backdrop-blur-md border-y border-divider py-3.5 sticky top-[60px] md:top-[66px] z-30 shadow-sm">
      <div className="container-custom flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
        
        {/* Category Pills (Horizontal scrolling list with smooth controls) */}
        <div className="relative flex items-center min-w-0 flex-1 group">
          {/* Left Gradient & Scroll Button */}
          {showLeftArrow && (
            <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 bg-gradient-to-r from-surface via-surface/90 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => scrollCategoryPills("left")}
                className="p-1 rounded-full bg-surface border border-border text-text-muted hover:text-text-primary hover:border-primary shadow-sm cursor-pointer pointer-events-auto transition-all"
                aria-label="Scroll left"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            </div>
          )}

          {/* Category List */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-none flex items-center gap-2 select-none py-1 w-full scroll-smooth"
          >
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "font-sans font-medium text-xs px-3.5 py-2 rounded-badge border shrink-0 transition-all duration-200 cursor-pointer select-none whitespace-nowrap",
                  isCatActive(cat.value)
                    ? "bg-primary border-primary text-primary-text font-semibold hover:bg-primary-hover shadow-glow"
                    : "bg-surface border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right Gradient & Scroll Button */}
          {showRightArrow && (
            <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 bg-gradient-to-l from-surface via-surface/90 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => scrollCategoryPills("right")}
                className="p-1 rounded-full bg-surface border border-border text-text-muted hover:text-text-primary hover:border-primary shadow-sm cursor-pointer pointer-events-auto transition-all"
                aria-label="Scroll right"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Search, Sort & Layout Controls Row */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full xl:w-auto justify-between sm:justify-end">
          {/* Custom Sort Dropdown */}
          <div className="relative shrink-0 font-sans w-full sm:w-[170px]" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-surface border border-border px-3.5 py-2 rounded-button text-xs font-semibold text-text-primary hover:border-border-medium hover:bg-accent-bg/30 flex items-center justify-between gap-2 cursor-pointer transition-all duration-200 shadow-sm"
            >
              <span className="truncate">Sort: {activeSortOption.label}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className={cn("w-3.5 h-3.5 text-text-muted shrink-0 transition-transform duration-200", dropdownOpen && "rotate-180")}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 left-0 sm:left-auto sm:w-[180px] mt-1.5 bg-surface border border-border rounded-button overflow-hidden shadow-card z-40 transition-all duration-150 animate-in fade-in slide-in-from-top-1.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer select-none",
                      sortBy === opt.value
                        ? "bg-accent-bg text-text-brand font-semibold"
                        : "text-text-muted hover:bg-accent-bg/40 hover:text-text-primary"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1 sm:flex-none sm:w-[200px] font-sans">
            <input
              type="text"
              placeholder="Search draws..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border pl-8 pr-3 py-2 rounded-button text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-border-medium focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>

          {/* Layout Toggle Buttons (Grid / List) */}
          <div className="flex items-center border border-border rounded-button overflow-hidden divide-x divide-border shrink-0 select-none bg-surface shadow-sm">
            {/* Grid Layout Toggle */}
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 cursor-pointer transition-all duration-200 select-none",
                viewMode === "grid"
                  ? "bg-accent-bg text-text-brand font-bold"
                  : "text-text-muted hover:text-text-primary hover:bg-accent-bg/30"
              )}
              title="Grid View"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                />
              </svg>
            </button>

            {/* List Layout Toggle */}
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 cursor-pointer transition-all duration-200 select-none",
                viewMode === "list"
                  ? "bg-accent-bg text-text-brand font-bold"
                  : "text-text-muted hover:text-text-primary hover:bg-accent-bg/30"
              )}
              title="List View"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 12h16.5m-16.5 5.25h16.5m-16.5-10.5h16.5"
                />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
