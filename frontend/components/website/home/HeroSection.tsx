'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { heroData } from '../../../data/homepage/hero.data';
import PrimaryButton from '../shared/PrimaryButton';
import SecondaryButton from '../shared/SecondaryButton';
import { raffleService } from '../../../services/raffle.service';

/**
 * Brand Hero section with title statements, stats counters, and static relevant platform showcase.
 */
export default function HeroSection() {
  const [dynamicStats, setDynamicStats] = useState<{ id: number; value: string; label: string }[] | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await raffleService.getPublicStats();
        if (stats && stats.length > 0) {
          setDynamicStats(stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }

    fetchStats();
  }, []);

  const {
    badgeText,
    paragraphText,
    stats: fallbackStats,
  } = heroData;

  const statsToShow = dynamicStats || fallbackStats;

  const titleParts = {
    start: "Win Premium",
    highlight: "Charity Gear",
    end: "For Less",
  };

  return (
    <section className='relative pt-32 pb-20 md:py-36 overflow-hidden'>
      {/* Background radial glow */}
      <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none' />
      <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full filter blur-[100px] pointer-events-none' />

      <div className='container-custom relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-center'>
          {/* Left Column: Copy & Stats */}
          <div className='lg:col-span-6 flex flex-col items-start text-left'>
            {/* Pill Badge */}
            <div className='inline-flex items-center bg-accent-bg border border-border px-3 py-1.5 rounded-badge text-[10px] font-semibold uppercase tracking-wider text-text-brand mb-6'>
              <span className='w-1.5 h-1.5 rounded-full bg-primary mr-2' />
              {badgeText}
            </div>

            {/* Heading 1 */}
            <h1 className='font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-text-primary leading-[1.1] tracking-tight mb-6'>
              {titleParts.start}{' '}
              <span className='text-text-brand block sm:inline'>{titleParts.highlight}</span>{' '}
              {titleParts.end}
            </h1>

            {/* Paragraph Description */}
            <p className='font-sans text-sm md:text-base text-text-muted leading-relaxed mb-8 max-w-xl'>
              {paragraphText}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12 w-full sm:w-auto">
              <PrimaryButton href="/live-raffles" className="w-full sm:w-auto px-8 py-3.5">
                View All Competitions
              </PrimaryButton>
              <SecondaryButton href="/how-it-works" className="w-full sm:w-auto px-8 py-3.5">
                How It Works
              </SecondaryButton>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-divider w-full">
              {statsToShow.map((stat) => (
                <div key={stat.id} className="flex flex-col">
                  <div className="font-heading font-bold text-xl md:text-2xl lg:text-3xl text-text-brand">
                    {stat.value}
                  </div>
                  <div className="font-sans text-[10px] md:text-xs text-text-muted font-medium uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Minimalist 3-Step "How to Win" Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[540px] bg-surface border border-border rounded-card p-6 sm:p-8 shadow-card relative overflow-hidden">
              {/* Subtle Ambient Background Accents */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent-bg/40 rounded-full blur-2xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-divider relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-text-brand uppercase tracking-wider mb-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Simple & Transparent
                  </div>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-text-primary">
                    How To Win In 3 Steps
                  </h3>
                </div>
              </div>

              {/* 3 Step Flow */}
              <div className="relative flex flex-col gap-6 z-10">
                {/* Connecting Vertical Line */}
                <div className="absolute left-[23px] top-[28px] bottom-[28px] w-[2px] bg-gradient-to-b from-primary via-primary/40 to-primary/20 pointer-events-none" />

                {/* Step 1 */}
                <div className="relative flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-accent-bg border-2 border-primary/30 flex items-center justify-center font-heading font-bold text-base text-primary shrink-0 group-hover:scale-105 group-hover:border-primary transition-all shadow-sm">
                    01
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-base text-text-primary group-hover:text-primary transition-colors">
                        Pick Your Tickets
                      </h4>
                      <span className="text-[10px] font-semibold text-text-brand bg-accent-bg px-2 py-0.5 rounded-badge">
                        Instant Wins
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                      Choose your prize competition and select your lucky numbers. Multiple entries increase your chances.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-accent-bg border-2 border-primary/30 flex items-center justify-center font-heading font-bold text-base text-primary shrink-0 group-hover:scale-105 group-hover:border-primary transition-all shadow-sm">
                    02
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-base text-text-primary group-hover:text-primary transition-colors">
                        Support UK Charities
                      </h4>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-badge">
                        Good Cause
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                      A guaranteed portion of every ticket goes directly to verified registered charity partners across the UK.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-heading font-bold text-base shrink-0 group-hover:scale-105 transition-all shadow-glow">
                    03
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-base text-text-primary group-hover:text-primary transition-colors">
                        Win & Celebrate
                      </h4>
                      <span className="text-[10px] font-semibold text-primary bg-accent-bg px-2 py-0.5 rounded-badge">
                        Live Draw
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                      Tune into our live streamed draw. Guaranteed winners with next-day payouts and direct prize delivery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Action */}
              <div className="mt-8 pt-5 border-t border-divider flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100% Guaranteed Draws • No Rollovers</span>
                </div>
                <Link
                  href="/live-raffles"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-text-brand hover:text-primary-hover hover:underline"
                >
                  <span>Browse Live Draws</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
