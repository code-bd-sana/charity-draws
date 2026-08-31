"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import PrimaryButton from "../../components/website/shared/PrimaryButton";
import SecondaryButton from "../../components/website/shared/SecondaryButton";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error boundary caught exception:", error);
  }, [error]);

  return (
    <div className="w-full min-h-[500px] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="max-w-lg w-full bg-surface border border-border rounded-card p-8 shadow-card flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5">
          <AlertCircle className="w-7 h-7 text-amber-500" />
        </div>

        <h3 className="font-heading font-bold text-xl md:text-2xl text-text-primary mb-2">
          Dashboard View Error
        </h3>

        <p className="font-sans text-xs md:text-sm text-text-secondary mb-6 leading-relaxed">
          We encountered an issue loading this section of your portal. Any saved data remains safe and secure.
        </p>

        {error?.message && (
          <div className="text-xs font-mono bg-bg border border-border p-3 rounded-button text-red-500 mb-6 max-w-full overflow-x-auto text-left w-full">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <PrimaryButton
            onClick={() => reset()}
            className="flex-1 py-3 text-xs uppercase tracking-wider"
          >
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Reload Section
            </span>
          </PrimaryButton>

          <Link href="/dashboard" className="flex-1">
            <SecondaryButton className="w-full py-3 text-xs uppercase tracking-wider">
              <span className="flex items-center justify-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </span>
            </SecondaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
