"use client";

import React, { useState } from "react";
import DrawCard from "../shared/DrawCard";

interface HostProfileTabsProps {
  host?: {
    id?: string;
    slug?: string;
    name?: string;
    bio?: string | null;
    location?: string | null;
    phone?: string | null;
    email?: string | null;
    isVerified?: boolean;
    drawsHosted?: number;
    activeDrawsCount?: number;
    pastDrawsCount?: number;
    memberSince?: number | string;
    joinedAt?: string;
  };
  raffles?: any[];
}

export default function HostProfileTabs({ host, raffles = [] }: HostProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"active" | "past" | "about">("active");

  const liveDraws = raffles.filter(
    (r) => r.status === 'ACTIVE' || r.status === 'live',
  );
  const pastDraws = raffles.filter(
    (r) =>
      r.status === 'ENDED' ||
      r.status === 'COMPLETED' ||
      r.status === 'ended' ||
      r.status === 'completed',
  );

  const formattedJoinedDate = host?.joinedAt
    ? new Date(host.joinedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : host?.memberSince
      ? `Year ${host.memberSince}`
      : 'Registered Host';

  return (
    <div className="flex flex-col mt-8 select-none">
      {/* Tabs Row */}
      <div className="flex items-center gap-8 border-b border-border mb-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 text-[14px] font-semibold transition-colors border-b-[2px] -mb-[1px] whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "active"
              ? "border-primary text-text-brand font-bold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <span>Active Draws</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === "active"
                ? "bg-primary text-primary-text"
                : "bg-surface-elevated text-text-muted"
            }`}
          >
            {liveDraws.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("past")}
          className={`pb-4 text-[14px] font-semibold transition-colors border-b-[2px] -mb-[1px] whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "past"
              ? "border-primary text-text-brand font-bold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <span>Past Draws</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === "past"
                ? "bg-primary text-primary-text"
                : "bg-surface-elevated text-text-muted"
            }`}
          >
            {pastDraws.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`pb-4 text-[14px] font-semibold transition-colors border-b-[2px] -mb-[1px] whitespace-nowrap cursor-pointer ${
            activeTab === "about"
              ? "border-primary text-text-brand font-bold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          About Host
        </button>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {/* Active Draws */}
        {activeTab === "active" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {liveDraws.length > 0 ? (
              liveDraws.map((draw) => <DrawCard key={draw.id} draw={draw} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3 w-full col-span-full bg-surface border border-border rounded-card p-8">
                <span className="text-[36px]">🎟️</span>
                <h3 className="font-heading font-bold text-[18px] text-text-primary">
                  No Active Draws
                </h3>
                <p className="font-sans text-[13px] text-text-muted max-w-[340px] leading-relaxed">
                  {host?.name || "This host"} currently has no active live competitions.
                  Check back soon or explore their past draws!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Past Draws */}
        {pastDraws.length > 0 && activeTab === "past" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {pastDraws.map((draw) => (
              <DrawCard key={draw.id} draw={draw} />
            ))}
          </div>
        )}

        {pastDraws.length === 0 && activeTab === "past" && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3 w-full col-span-full bg-surface border border-border rounded-card p-8 animate-in fade-in duration-300">
            <span className="text-[36px]">🏆</span>
            <h3 className="font-heading font-bold text-[18px] text-text-primary">
              No Past Draws
            </h3>
            <p className="font-sans text-[13px] text-text-muted max-w-[320px] leading-relaxed">
              This host has not concluded any draws yet. Completed competitions and winner details will be listed here.
            </p>
          </div>
        )}

        {/* About Host (Real DB Data) */}
        {activeTab === "about" && (
          <div className="animate-in fade-in duration-300 flex flex-col gap-8 max-w-[900px]">
            {/* Bio Card */}
            <div className="bg-surface border border-border rounded-card p-6 md:p-8 shadow-card flex flex-col gap-4">
              <h3 className="font-heading font-bold text-[18px] text-text-primary flex items-center gap-2">
                <span>About</span>
                <span className="text-text-brand">{host?.name}</span>
              </h3>
              <p className="font-sans text-[14px] text-text-muted leading-relaxed font-medium">
                {host?.bio ||
                  "This partner has not written a public biography yet. They are a verified host operating compliant competitions on Charity Draws."}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-surface border border-border rounded-card p-5 shadow-card flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Partner Verification
                </span>
                <span className="font-heading font-semibold text-[15px] text-text-primary flex items-center gap-2">
                  {host?.isVerified ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Verified Partner
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Registered Host
                    </>
                  )}
                </span>
                <span className="text-[12px] text-text-muted mt-1">
                  Identity and compliance audited
                </span>
              </div>

              <div className="bg-surface border border-border rounded-card p-5 shadow-card flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Registered Location
                </span>
                <span className="font-heading font-semibold text-[15px] text-text-primary flex items-center gap-1.5 truncate">
                  <span>📍</span> {host?.location || "United Kingdom"}
                </span>
                <span className="text-[12px] text-text-muted mt-1">
                  Host operating jurisdiction
                </span>
              </div>

              <div className="bg-surface border border-border rounded-card p-5 shadow-card flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Platform Member Since
                </span>
                <span className="font-heading font-semibold text-[15px] text-text-primary">
                  {formattedJoinedDate}
                </span>
                <span className="text-[12px] text-text-muted mt-1">
                  Official host profile active
                </span>
              </div>

              <div className="bg-surface border border-border rounded-card p-5 shadow-card flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Total Draws Hosted
                </span>
                <span className="font-heading font-bold text-[20px] text-text-brand">
                  {host?.drawsHosted ?? raffles.length}
                </span>
                <span className="text-[12px] text-text-muted mt-0.5">
                  Lifetime competitions launched
                </span>
              </div>

              <div className="bg-surface border border-border rounded-card p-5 shadow-card flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Currently Live
                </span>
                <span className="font-heading font-bold text-[20px] text-emerald-600">
                  {liveDraws.length}
                </span>
                <span className="text-[12px] text-text-muted mt-0.5">
                  Open for ticket entries
                </span>
              </div>

              <div className="bg-surface border border-border rounded-card p-5 shadow-card flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Concluded Draws
                </span>
                <span className="font-heading font-bold text-[20px] text-text-primary">
                  {pastDraws.length}
                </span>
                <span className="text-[12px] text-text-muted mt-0.5">
                  Draws with winners determined
                </span>
              </div>
            </div>

            {/* Platform Guarantee Banner */}
            <div className="bg-accent-bg/40 border border-border rounded-card p-5 flex items-start gap-4">
              <span className="text-[24px]">🛡️</span>
              <div className="flex flex-col gap-1">
                <h4 className="font-heading font-bold text-[14px] text-text-primary">
                  Guaranteed Fair & Audited
                </h4>
                <p className="font-sans text-[12px] text-text-muted leading-relaxed">
                  All draws created by verified hosts on Charity Draws adhere to UK Gambling Act 2005 compliance. Winning tickets are selected via verified cryptographic random draws, ensuring 100% fair play.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
