import React from "react";
import Link from "next/link";
import { VerifiedHost } from "../../../types/host.types";

interface VerifiedHostCardProps {
  host: VerifiedHost;
}

export default function VerifiedHostCard({ host }: VerifiedHostCardProps) {
  return (
    <Link href={`/hosts/${host.slug}`} className="block h-full">
      <div className="bg-surface border border-border rounded-card p-6 shadow-card hover:border-border-medium hover:shadow-glow transition-all duration-300 w-full min-h-[200px] flex flex-col justify-between group cursor-pointer relative overflow-hidden">
        
        {/* Subtle hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="w-[56px] h-[56px] rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-text-brand font-heading font-bold text-[20px]">
              {host.logo && (host.logo.startsWith('http') || host.logo.startsWith('/')) ? (
                <img src={host.logo} alt={host.name} className="w-full h-full object-cover" />
              ) : (
                <span>{host.logo || host.name.charAt(0)}</span>
              )}
            </div>
            {host.isVerified && (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-badge text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Verified
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading font-bold text-text-primary text-[18px] group-hover:text-text-brand transition-colors">
              {host.name}
            </h3>
            <span className="font-sans text-[13px] text-text-muted line-clamp-2 leading-relaxed font-medium">
              {host.description}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-divider relative z-10">
          <div className="flex items-center gap-4 text-[12px] font-sans text-text-brand font-semibold">
            <span>{host.competitionCount} Competitions</span>
            {host.averageRating && (
              <span className="flex items-center gap-1.5">
                <span className="text-amber-400">★</span> {host.averageRating}
              </span>
            )}
          </div>
          <span className="text-primary font-bold text-[13px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
            View Profile 
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
