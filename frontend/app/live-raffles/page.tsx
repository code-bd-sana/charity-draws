import React, { Suspense } from "react";
import type { Metadata } from "next";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import LiveRafflesHero from "../../components/website/live-raffles/LiveRafflesHero";
import LiveRaffleGrid from "../../components/website/live-raffles/LiveRaffleGrid";

export const metadata: Metadata = {
  title: "Live Competitions | Charity Draws",
  description:
    "Browse and enter active premium charity drawings, AEGs, GBBs, sidearms, tactical gear, and cash prize draws. Tickets from £1.",
};

/**
 * Public Live Raffles Page.
 * Renders all active gear draws with category, sorting, search, and layout controls.
 */
export default function LiveRafflesPage() {
  return (
    <>
      {/* Global Header Navigation */}
      <WebsiteNavbar />

      <main className="min-h-screen flex flex-col bg-surface pt-20 lg:pt-[66px] pb-12 relative overflow-hidden">
        {/* Background Glows & Grid Pattern matching Homepage */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-100 pointer-events-none" />

        <div className="relative z-10 flex flex-col flex-grow">
          {/* Page Hero Section */}
          <LiveRafflesHero />

          {/* Suspense Boundary for Client Search Params Filtering Grid */}
          <Suspense
            fallback={
              <div className="container-custom py-20 text-center text-text-muted font-sans animate-pulse">
                Loading active competitions...
              </div>
            }
          >
            <LiveRaffleGrid />
          </Suspense>
        </div>
      </main>

      {/* Global Footer */}
      <WebsiteFooter />
    </>
  );
}
