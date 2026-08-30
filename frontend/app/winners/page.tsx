import React from "react";
import type { Metadata } from "next";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import WinnersHero from "../../components/website/winners/WinnersHero";
import WinnersGrid from "../../components/website/winners/WinnersGrid";
import WinnerHighlightCard from "../../components/website/winners/WinnerHighlightCard";

export const metadata: Metadata = {
  title: "Winners Gallery | Charity Draws",
  description:
    "See all the completed raffle winners. Check past draw dates, verified delivered prizes, and transparency records.",
};

/**
 * Public 'Winners' page route at `/winners`.
 * Composes layout for header navbar, hero stats, filtering grids, testimonial highlight, and footer.
 */
export default function WinnersPage() {
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
          {/* Page Hero with stats counters */}
          <WinnersHero />

          {/* Stateful timeline grid + pagination card list */}
          <WinnersGrid />

          {/* Featured winner testimonial row */}
          <WinnerHighlightCard />
        </div>
      </main>

      {/* Global website footer */}
      <WebsiteFooter />
    </>
  );
}
