"use client";

import React, { useState } from "react";
import { VerifiedHost } from "../../../types/host.types";
import VerifiedHostCard from "./VerifiedHostCard";
import { cn } from "../../../lib/utils";

interface VerifiedHostsListProps {
  hosts: VerifiedHost[];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function VerifiedHostsList({ hosts }: VerifiedHostsListProps) {
  const [activeLetter, setActiveLetter] = useState<string>("ALL");

  const filteredHosts = activeLetter === "ALL" 
    ? hosts 
    : hosts.filter(host => host.name.toUpperCase().startsWith(activeLetter));

  return (
    <div className="flex flex-col w-full select-none">
      {/* A-Z Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-divider">
        <button
          onClick={() => setActiveLetter("ALL")}
          className={cn(
            "h-[36px] px-4 rounded-badge font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
            activeLetter === "ALL"
              ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
              : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
          )}
        >
          All
        </button>
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            onClick={() => setActiveLetter(letter)}
            className={cn(
              "w-[36px] h-[36px] rounded-badge flex items-center justify-center font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
              activeLetter === letter
                ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
            )}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredHosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHosts.map((host) => (
            <VerifiedHostCard key={host.id} host={host} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-surface border border-border rounded-card w-full max-w-[600px] mx-auto shadow-card">
          <span className="text-[32px]">🔍</span>
          <h3 className="font-heading font-bold text-lg text-text-primary">No Hosts Found</h3>
          <p className="font-sans text-xs md:text-sm text-text-muted max-w-[320px] leading-relaxed">
            We couldn&apos;t find any verified hosts starting with the letter &quot;{activeLetter}&quot;. Try selecting &quot;All&quot; to see the full directory.
          </p>
        </div>
      )}
    </div>
  );
}
