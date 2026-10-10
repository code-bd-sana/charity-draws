"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCreateReviewMutation, useUpdateReviewMutation } from "@/hooks/useReviewHooks";
import { UserWinner } from "@/services/user.service";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: UserWinner | null;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

const RATING_LABELS: Record<number, string> = {
  1: "1 - Poor",
  2: "2 - Fair",
  3: "3 - Good",
  4: "4 - Very Good",
  5: "5 - Excellent",
};

export default function ReviewModal({
  isOpen,
  onClose,
  winner,
  existingReview,
}: ReviewModalProps) {
  const isEditing = Boolean(existingReview?.id);
  const createMutation = useCreateReviewMutation();
  const updateMutation = useUpdateReviewMutation();

  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingReview?.comment || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRating(existingReview?.rating || 5);
      setHoverRating(0);
      setComment(existingReview?.comment || "");
      setError(null);
    }
  }, [isOpen, existingReview]);

  if (!isOpen || !winner) return null;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const activeRating = hoverRating > 0 ? hoverRating : rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }

    try {
      if (isEditing && existingReview) {
        await updateMutation.mutateAsync({
          id: existingReview.id,
          data: {
            rating,
            comment: comment.trim() || undefined,
          },
        });
        toast.success("Review updated successfully!");
      } else {
        await createMutation.mutateAsync({
          winnerId: winner.id,
          rating,
          comment: comment.trim() || undefined,
        });
        toast.success("Thank you! Your verified winner review has been posted.");
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit review. Please try again.";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-surface border border-border rounded-card p-6 md:p-8 shadow-card overflow-hidden flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 text-text-muted hover:text-text-primary transition-colors p-1 rounded-button hover:bg-accent-bg cursor-pointer"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 text-text-brand text-xs font-bold uppercase tracking-wider">
            <span>🛡️</span>
            <span>Verified Winner Feedback</span>
          </div>
          <h2 className="font-heading font-bold text-xl md:text-2xl text-text-primary">
            {isEditing ? "Edit Your Review" : "Leave a Verified Review"}
          </h2>
          <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
            Share your experience with the host to help build trust in our community.
          </p>
        </div>

        {/* Prize / Host Summary Banner */}
        <div className="bg-bg border border-border rounded-card p-3.5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-accent-bg border border-border-medium flex items-center justify-center shrink-0 overflow-hidden text-xl">
            🏆
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-sans text-[11px] uppercase tracking-wider text-text-muted font-semibold">
              Won Prize
            </span>
            <span className="font-heading font-bold text-sm text-text-primary truncate">
              {winner.prizeName}
            </span>
            <span className="font-sans text-xs text-text-muted truncate">
              Hosted by <strong className="text-text-brand">{winner.raffle?.hostBusinessName || "Verified Host"}</strong>
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Star Rating Section */}
          <div className="flex flex-col items-center justify-center p-4 bg-surface-elevated/40 border border-border rounded-card gap-2">
            <label className="font-sans text-xs font-semibold uppercase tracking-wider text-text-muted">
              Select Your Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-3xl md:text-4xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <span
                    className={
                      star <= activeRating
                        ? "text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]"
                        : "text-border-medium hover:text-amber-200"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            <span className="font-sans font-bold text-sm text-amber-500 min-h-[20px]">
              {RATING_LABELS[activeRating] || ""}
            </span>
          </div>

          {/* Feedback Textarea */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="review-comment" className="font-sans text-xs font-semibold text-text-secondary">
                Your Feedback (Optional)
              </label>
              <span className="font-mono text-[11px] text-text-muted">
                {comment.length} / 1000
              </span>
            </div>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the communication, draw transparency, and prize dispatch? Your honest feedback helps everyone."
              className="w-full bg-bg border border-border rounded-button p-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary resize-none font-sans"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-button text-red-500 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-button border border-border bg-surface hover:bg-accent-bg text-text-secondary font-sans font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isSubmitting
                ? "Submitting..."
                : isEditing
                ? "Update Review"
                : "Submit Verified Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
