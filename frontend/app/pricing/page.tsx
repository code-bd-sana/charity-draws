import React from "react";
import type { Metadata } from "next";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import PricingHero from "../../components/website/pricing/PricingHero";
import PricingComparisonSection from "../../components/website/pricing/PricingComparisonSection";
import PricingFaqSection from "../../components/website/pricing/PricingFaqSection";

export const metadata: Metadata = {
  title: "Pricing & Plans | Charity Draws",
  description:
    "Choose the right hosting plan for your charity competitions. Start free or unlock advanced host dashboard access, custom branding, and priority payouts.",
};

/**
 * Public 'Pricing' page route at `/pricing`.
 * Composes layout for navbar header, plan cards, comparison matrix table, FAQs accordion, and footer.
 */
export default function PricingPage() {
  return (
    <>
      {/* Sticky top navbar */}
      <WebsiteNavbar />

      <main className="min-h-screen flex flex-col bg-surface pt-20 lg:pt-[66px] pb-12 relative overflow-hidden">
        {/* Background Glows & Grid Pattern matching Homepage */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-100 pointer-events-none" />

        <div className="relative z-10 flex flex-col flex-grow">
          {/* Hero Section & Plan Grid switcher */}
          <PricingHero />

          {/* Feature Comparison Grid table */}
          <PricingComparisonSection />

          {/* FAQ Accordion Section */}
          <PricingFaqSection />
        </div>
      </main>

      {/* Global website footer */}
      <WebsiteFooter />
    </>
  );
}
