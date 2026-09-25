"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import PrimaryButton from "../components/website/shared/PrimaryButton";
import SecondaryButton from "../components/website/shared/SecondaryButton";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime error to console or error tracking
    console.error("Runtime exception captured by App Root Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="max-w-md w-full bg-surface border border-border rounded-card p-8 shadow-card flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="font-heading font-bold text-2xl text-text-primary mb-2">
          Something went wrong
        </h2>

        <p className="font-sans text-xs md:text-sm text-text-secondary mb-6 leading-relaxed">
          An unexpected error occurred while loading this page. You can attempt to retry or return to the homepage.
        </p>

        {error?.digest && (
          <div className="text-[11px] font-mono bg-bg px-3 py-1.5 rounded-button text-text-muted mb-6">
            Error ID: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <PrimaryButton
            onClick={() => reset()}
            className="flex-1 py-3 text-xs uppercase tracking-wider"
          >
            <span className="flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </span>
          </PrimaryButton>

          <Link href="/" className="flex-1">
            <SecondaryButton className="w-full py-3 text-xs uppercase tracking-wider">
              <span className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Home
              </span>
            </SecondaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
