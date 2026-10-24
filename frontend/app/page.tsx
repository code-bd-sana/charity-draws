import React from 'react';
import WebsiteNavbar from '../components/website/layout/WebsiteNavbar';
import WebsiteFooter from '../components/website/layout/WebsiteFooter';
import HeroSection from '../components/website/home/HeroSection';
import FeaturedCompetitionsSection from '../components/website/home/FeaturedCompetitionsSection';

import HowItWorksSection from '../components/website/home/HowItWorksSection';
import TrustBenefitsSection from '../components/website/home/TrustBenefitsSection';
import WinnersSection from '../components/website/home/WinnersSection';
import InstantWinsSection from '../components/website/home/InstantWinsSection';
import FinalCtaSection from '../components/website/home/FinalCtaSection';
import TestimonialsSection from '../components/website/home/TestimonialsSection';
import FaqSection from '../components/website/home/FaqSection';
import NewsletterSection from '../components/website/home/NewsletterSection';

/** Public homepage: original section order and functionality are preserved. */
export default function Home() {
  return (
    <>
      <WebsiteNavbar />
      <main className='min-h-screen flex flex-col bg-surface pt-20 lg:pt-[66px] pb-12 relative overflow-hidden'>
        <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none' />
        <div className='relative z-10 flex flex-col'>
          <HeroSection />
          <FeaturedCompetitionsSection />
          <HowItWorksSection />
          <TrustBenefitsSection />
          <WinnersSection />
          <InstantWinsSection />
          <FinalCtaSection />
          {/* <TestimonialsSection /> */}
          <FaqSection />
          <NewsletterSection />
        </div>
      </main>
      <WebsiteFooter />
    </>
  );
}
