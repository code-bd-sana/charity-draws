"use client";

import React, { useState } from "react";
import { useHostReviewsQuery } from "@/hooks/useReviewHooks";
import HostReviewCard from "./HostReviewCard";

interface HostReviewListProps {
  hostId: string;
}

export default function HostReviewList({ hostId }: HostReviewListProps) {
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError, refetch } = useHostReviewsQuery(hostId, {
    rating: selectedRating,
    page,
    limit: 20,
  });

  const stats = data?.stats;
  const reviews = data?.reviews || [];
  const totalReviews = stats?.totalReviews || 0;
  const averageRating = stats?.averageRating;
  const breakdown = stats?.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const percentages = stats?.percentages || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-card">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-sans text-sm text-text-muted font-medium">Loading verified host reviews...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-surface border border-red-200/50 rounded-card p-6 text-center">
        <span className="text-3xl mb-2">⚠️</span>
        <h4 className="font-heading font-bold text-base text-text-primary mb-1">
          Unable to Load Reviews
        </h4>
        <p className="font-sans text-xs text-text-muted mb-4 max-w-sm">
          An error occurred while retrieving reviews for this host.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-button bg-primary text-white font-sans font-semibold text-xs shadow-sm hover:bg-primary-hover cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 1. Empty state: No reviews for this host at all
  if (totalReviews === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-surface border border-border rounded-card shadow-card gap-4">
        <div className="w-16 h-16 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center text-3xl shadow-sm">
          💬
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <h3 className="font-heading font-bold text-lg md:text-xl text-text-primary">
            No Host Reviews Yet
          </h3>
          <p className="font-sans text-xs md:text-sm text-text-muted leading-relaxed font-medium">
            This host doesn&apos;t have any verified reviews yet. As winners claim prizes and share their feedback, their transparent ratings will appear right here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* 1. Score Overview Card */}
      <div className="bg-surface border border-border rounded-card p-6 md:p-8 shadow-card flex flex-col md:flex-row gap-8 items-stretch md:items-center justify-between">
        {/* Left Side: Big Average Rating Display */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center min-w-[200px] border-b md:border-b-0 md:border-r border-divider pb-6 md:pb-0 md:pr-8">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-black text-5xl md:text-6xl text-text-primary tracking-tight">
              {averageRating !== null && averageRating !== undefined
                ? averageRating.toFixed(1)
                : "—"}
            </span>
            <span className="font-heading font-bold text-xl md:text-2xl text-text-muted">
              / 5.0
            </span>
          </div>

          {/* Stars visual */}
          <div className="flex items-center gap-1 text-amber-400 text-xl my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={
                  star <= Math.round(averageRating || 0)
                    ? "opacity-100 drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)]"
                    : "opacity-25 text-text-muted"
                }
              >
                ★
              </span>
            ))}
          </div>

          <span className="font-sans text-xs font-semibold text-text-muted">
            Based on <strong className="text-text-primary font-bold">{totalReviews}</strong> verified winner {totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Right Side: Interactive 1-5 Star Distribution Progress Bars */}
        <div className="flex-1 flex flex-col gap-2.5 max-w-lg">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0;
            const pct = percentages[star] || 0;
            const isSelected = selectedRating === star;

            return (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setPage(1);
                  setSelectedRating(isSelected ? undefined : star);
                }}
                className={`flex items-center gap-3 w-full py-1 px-2 rounded-lg transition-colors text-left group cursor-pointer ${
                  isSelected ? "bg-accent-bg border border-border-medium" : "hover:bg-accent-bg/40"
                }`}
                title={`Click to filter by ${star} star reviews`}
              >
                <div className="flex items-center gap-1 w-12 text-xs font-sans font-bold text-text-secondary group-hover:text-text-primary">
                  <span>{star}</span>
                  <span className="text-amber-400">★</span>
                </div>

                <div className="flex-1 h-2.5 bg-bg border border-border rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected ? "bg-primary" : "bg-amber-400 group-hover:bg-amber-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="w-16 text-right font-sans text-xs text-text-muted font-medium">
                  {count} <span className="text-[10px] opacity-75">({pct}%)</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setPage(1);
            setSelectedRating(undefined);
          }}
          className={`px-4 py-2 rounded-badge font-sans font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
            selectedRating === undefined
              ? "bg-primary text-white shadow-sm"
              : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-accent-bg"
          }`}
        >
          All Reviews ({totalReviews})
        </button>

        {[5, 4, 3, 2, 1].map((star) => {
          const count = breakdown[star] || 0;
          const isSelected = selectedRating === star;

          return (
            <button
              key={star}
              onClick={() => {
                setPage(1);
                setSelectedRating(isSelected ? undefined : star);
              }}
              className={`px-3.5 py-2 rounded-badge font-sans font-semibold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-accent-bg"
              }`}
            >
              <span className="text-amber-400">★</span>
              <span>{star} Stars</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? "bg-white/20 text-white" : "bg-bg text-text-muted"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Review Cards / Empty Filter State */}
      {reviews.length === 0 && selectedRating !== undefined ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-surface border border-border rounded-card text-center gap-4">
          <span className="text-3xl">🔍</span>
          <div className="flex flex-col gap-1 max-w-sm">
            <h4 className="font-heading font-bold text-base text-text-primary">
              No {selectedRating}-Star Reviews Found
            </h4>
            <p className="font-sans text-xs text-text-muted font-medium">
              There are currently no approved reviews matching this star filter.
            </p>
          </div>
          <button
            onClick={() => {
              setPage(1);
              setSelectedRating(undefined);
            }}
            className="px-4 py-2 rounded-button bg-primary text-white font-sans font-semibold text-xs shadow-sm hover:bg-primary-hover cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <HostReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
