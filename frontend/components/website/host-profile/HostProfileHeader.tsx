"use client";

import React from "react";

interface HostProfileHeaderProps {
  name: string;
  bio?: string | null;
  logo?: string | null;
  isVerified: boolean;
  drawsHosted: number;
  activeDrawsCount?: number;
  pastDrawsCount?: number;
  memberSince: number | string;
  location?: string | null;
}

export default function HostProfileHeader({
  name,
  bio,
  logo,
  isVerified,
  drawsHosted,
  activeDrawsCount = 0,
  pastDrawsCount = 0,
  memberSince,
  location,
}: HostProfileHeaderProps) {
  const isImageLogo = Boolean(
    logo &&
      (logo.startsWith('http://') ||
        logo.startsWith('https://') ||
        logo.startsWith('/') ||
        logo.startsWith('data:') ||
        logo.includes('/uploads/'))
  );

  const logoSrc = isImageLogo
    ? logo!.startsWith('http') || logo!.startsWith('/') || logo!.startsWith('data:')
      ? logo!
      : `/${logo}`
    : null;

  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'H';

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-border">
      <div className="flex items-center gap-5">
        <div className="w-[88px] h-[88px] rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
          {logoSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logoSrc} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-heading font-bold text-text-brand text-[32px]">{initials}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-[28px] text-text-primary tracking-tight">{name}</h1>
            {isVerified && (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-badge text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Verified Host
              </span>
            )}
          </div>
          <p className="font-sans text-[14px] text-text-muted max-w-[580px] font-medium leading-relaxed">
            {bio || "Verified host running transparent charity competitions on Charity Draws."}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-1">
            <span className="font-sans text-[12px] text-text-brand font-semibold tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 bg-primary rounded-full" />
              {drawsHosted} {drawsHosted === 1 ? 'Competition' : 'Competitions'}
            </span>
            <span className="font-sans text-[12px] text-text-brand font-semibold tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              {activeDrawsCount} Active {activeDrawsCount === 1 ? 'Draw' : 'Draws'}
            </span>
            {pastDrawsCount > 0 && (
              <span className="font-sans text-[12px] text-text-brand font-semibold tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                {pastDrawsCount} Completed
              </span>
            )}
            {location && (
              <span className="font-sans text-[12px] text-text-muted font-medium tracking-wide flex items-center gap-1">
                <span>📍</span>
                {location}
              </span>
            )}
            <span className="font-sans text-[12px] text-text-muted font-medium tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 bg-border-medium rounded-full" />
              Member since {memberSince}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
