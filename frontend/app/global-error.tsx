"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#121212] border border-[#222] rounded-2xl p-8 shadow-2xl text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold font-heading mb-2 text-white">
            Application Error
          </h2>

          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
            A critical unexpected error occurred. Our team has been notified. Please try refreshing or reloading the page.
          </p>

          {error?.digest && (
            <div className="text-[11px] font-mono bg-neutral-900 px-3 py-1.5 rounded-md text-neutral-500 mb-6">
              Digest: {error.digest}
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={() => reset()}
              className="flex-1 py-3 bg-[#e8a838] hover:bg-[#d69627] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
