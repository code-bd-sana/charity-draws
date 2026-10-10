"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ReviewItem } from "@/types/review.types";
import { useFlagReviewMutation } from "@/hooks/useReviewHooks";

interface HostReviewCardProps {
  review: ReviewItem;
}

export default function HostReviewCard({ review }: HostReviewCardProps) {
  const [isFlagged, setIsFlagged] = useState(
    review.status?.toUpperCase() === "FLAGGED"
  );
  const flagMutation = useFlagReviewMutation();

  const handleFlag = async () => {
    if (isFlagged || flagMutation.isPending) return;
    try {
      await flagMutation.mutateAsync({
        id: review.id,
        reason: "User flagged for review",
      });
      setIsFlagged(true);
      toast.success("Review flagged for administrative moderation.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to flag review for moderation."
      );
    }
  };

  const formattedDate = review.createdAt
    ? (() => {
        try {
          return format(new Date(review.createdAt), "dd MMM yyyy");
        } catch {
          return String(review.createdAt);
        }
      })()
    : "Verified Winner";

  const reviewerInitials = (review.reviewerName || "W")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const commentText = review.comment || review.message || "";
  const prizeDisplay = review.prizeTitle || review.competitionTitle;

  return (
    <div
      className={`border rounded-card p-5 transition-all duration-200 flex flex-col justify-between shadow-card ${
        isFlagged
          ? "bg-red-950/20 border-red-900/50 opacity-80"
          : "bg-surface border-border hover:border-border-medium hover:shadow-glow"
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* Top Header: Avatar, Name, Rating & Date */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Reviewer Avatar */}
            <div className="w-10 h-10 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0 overflow-hidden text-text-brand font-heading font-bold text-sm shadow-sm">
              {review.reviewerAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={review.reviewerAvatar}
                  alt={review.reviewerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{reviewerInitials}</span>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-text-primary text-sm truncate">
                  {review.reviewerName}
                </span>
                {/* Verified Winner Badge */}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-badge bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-sans font-bold uppercase tracking-wider shrink-0 shadow-sm">
                  <span>✓</span> Verified Winner
                </span>
              </div>
              <span className="font-sans text-[11px] text-text-muted mt-0.5">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Stars visual */}
          <div className="flex items-center gap-0.5 text-amber-400 text-sm shrink-0">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= review.rating ? "opacity-100" : "opacity-20 text-text-muted"}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Won Prize Badge */}
        {prizeDisplay && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-accent-bg border border-border-medium w-fit text-[11px] font-sans font-semibold text-text-brand shadow-sm">
            <span>🏆</span>
            <span className="truncate max-w-[280px]">Won: {prizeDisplay}</span>
          </div>
        )}

        {/* Review Comment Text */}
        <p className="font-sans text-sm text-text-secondary leading-relaxed mt-1">
          {isFlagged ? (
            <span className="italic text-text-muted">
              This review has been flagged and is currently pending administrator moderation.
            </span>
          ) : commentText ? (
            commentText
          ) : (
            <span className="italic text-text-muted">
              (Winner left a verified {review.rating}-star rating with no text comment)
            </span>
          )}
        </p>
      </div>

      {/* Card Footer: Flag Button */}
      {!isFlagged && review.canBeFlagged !== false && (
        <div className="flex justify-end pt-3 mt-3 border-t border-divider">
          <button
            onClick={handleFlag}
            disabled={flagMutation.isPending}
            className="text-[11px] font-sans font-semibold text-text-muted hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3v1.5M3 21v-6m0 0 2.77-.693a15.26 15.26 0 0 1 9.46 0l2.77.693M3 15V4.5A1.5 1.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5v10.5M21 15v-6"
              />
            </svg>
            {flagMutation.isPending ? "Flagging..." : "Flag for Review"}
          </button>
        </div>
      )}
    </div>
  );
}
