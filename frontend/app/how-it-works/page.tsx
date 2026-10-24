import React from 'react';
import type { Metadata } from 'next';
import WebsiteNavbar from '../../components/website/layout/WebsiteNavbar';
import WebsiteFooter from '../../components/website/layout/WebsiteFooter';
import HowItWorksHero from '../../components/website/how-it-works/HowItWorksHero';
import HowItWorksStepsSection from '../../components/website/how-it-works/HowItWorksStepsSection';
import HowItWorksVideoSection from '../../components/website/how-it-works/HowItWorksVideoSection';
import HowItWorksFinalCta from '../../components/website/how-it-works/HowItWorksFinalCta';

export const metadata: Metadata = {
  title: 'How It Works | Charity Draws',
  description:
    'Learn how to enter premium charity gear drawings or host your own competitions with transparent random draws and instant payouts.',
};

/**
 * Public 'How It Works' page route at `/how-it-works`.
 * Composes the Hero banner, toggleable Entrant/Host step guides, and final Call to Action sections.
 */
export default function HowItWorksPage() {
  return (
    <>
      {/* Sticky top navbar */}
      <WebsiteNavbar />

      <main className="min-h-screen flex flex-col bg-surface pt-20 lg:pt-[66px] pb-12 relative overflow-hidden">
        {/* Background Glows matching Homepage */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col flex-grow">
          {/* Hero Section */}
          <HowItWorksHero />

          {/* Tabbed Step Timeline Section */}
          <HowItWorksStepsSection />

          {/* Playable Video Section */}
          {/* <HowItWorksVideoSection /> */}

          {/* Bottom Call to Action Section */}
          <HowItWorksFinalCta />
        </div>
      </main>

      {/* Website Footer */}
      <WebsiteFooter />
    </>
  );
}
