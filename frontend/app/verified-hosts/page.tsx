import React from "react";
import { Metadata } from "next";
import VerifiedHostsList from "../../components/website/verified-hosts/VerifiedHostsList";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verified Charities | Charity Draws",
  description: "Browse verified registered charities running official prize competitions on Charity Draws.",
};

export default async function VerifiedHostsPage() {
  let verifiedHosts = [];
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const candidateUrls = [
      process.env.BACKEND_API_URL,
      process.env.NEXT_PUBLIC_API_URL,
      isProd ? 'https://api.charitydraws.co.uk/api/v1' : 'http://localhost:5000/api/v1',
      'https://api.charitydraws.co.uk/api/v1',
      'http://127.0.0.1:5000/api/v1',
    ].filter(Boolean) as string[];

    for (const apiUrl of Array.from(new Set(candidateUrls.map(u => u.replace(/\/+$/, ''))))) {
      try {
        const res = await fetch(`${apiUrl}/hosts/verified`, {
          cache: 'no-store'
        });
        if (res.ok) {
          const json = await res.json();
          const rawHosts = Array.isArray(json.data)
            ? json.data
            : Array.isArray(json)
            ? json
            : [];
          verifiedHosts = rawHosts.filter(
            (h: any) => h.isBlocked !== true && (h.isEmailVerified === undefined || h.isEmailVerified === true)
          );
          break;
        }
      } catch (err) {}
    }
  } catch (err) {
    console.error("Failed to fetch verified charities", err);
  }

  return (
    <>
      <WebsiteNavbar />
      <main className="min-h-screen flex flex-col bg-surface pt-20 lg:pt-[66px] pb-12 relative overflow-hidden select-none">
        {/* Background Glows matching Homepage */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 container-custom pt-12 md:pt-16 pb-12">
          {/* Header Section */}
          <div className="max-w-3xl mb-12 flex flex-col items-start gap-3">
            {/* Pill Badge */}
            <div className="inline-flex items-center bg-accent-bg border border-border px-3.5 py-1.5 rounded-badge text-[11px] font-semibold uppercase tracking-wider text-text-brand mb-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
              VERIFIED CHARITIES DIRECTORY
            </div>

            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-text-primary tracking-tight leading-tight">
              All Verified{" "}
              <span className="text-text-brand bg-gradient-to-r from-primary to-[#8A46E4] bg-clip-text text-transparent">
                Charities
              </span>
            </h1>
            <p className="font-sans text-sm sm:text-base md:text-lg text-text-muted leading-relaxed max-w-2xl font-medium mt-1">
              Explore our directory of fully vetted charity partners. Every charity on Charity Draws undergoes rigorous verification and compliance checks to ensure your competitions support genuine causes with 100% transparency.
            </p>
          </div>
          
          <VerifiedHostsList hosts={verifiedHosts} />
        </div>
      </main>
      <WebsiteFooter />
    </>
  );
}
