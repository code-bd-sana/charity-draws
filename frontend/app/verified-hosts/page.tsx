import React from "react";
import { Metadata } from "next";
import { verifiedHostsData } from "../../data/hosts/hosts.data";
import VerifiedHostsList from "../../components/website/verified-hosts/VerifiedHostsList";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";

export const metadata: Metadata = {
  title: "Verified Hosts | Charity Draws",
  description: "Browse verified hosts running premium charity competitions.",
};

export default async function VerifiedHostsPage() {
  let verifiedHosts = [];
  try {
    const apiUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:5000/api/v1';
    const res = await fetch(`${apiUrl}/hosts/verified`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      verifiedHosts = json.data || json;
    }
  } catch (err) {
    console.error("Failed to fetch verified hosts", err);
  }

  return (
    <>
      <WebsiteNavbar />
      <main className="min-h-screen flex flex-col bg-surface pt-20 lg:pt-[66px] pb-12 relative overflow-hidden select-none">
        {/* Background Glows & Grid Pattern matching Homepage */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-100 pointer-events-none" />

        <div className="relative z-10 container-custom pt-12 md:pt-16 pb-12">
          {/* Header Section */}
          <div className="max-w-3xl mb-12 flex flex-col items-start gap-3">
            {/* Pill Badge */}
            <div className="inline-flex items-center bg-accent-bg border border-border px-3.5 py-1.5 rounded-badge text-[11px] font-semibold uppercase tracking-wider text-text-brand mb-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
              VERIFIED PARTNERS DIRECTORY
            </div>

            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-text-primary tracking-tight leading-tight">
              All Verified{" "}
              <span className="text-text-brand bg-gradient-to-r from-primary to-[#8A46E4] bg-clip-text text-transparent">
                Hosts
              </span>
            </h1>
            <p className="font-sans text-sm sm:text-base md:text-lg text-text-muted leading-relaxed max-w-2xl font-medium mt-1">
              Explore our directory of fully vetted partners. Every host on Charity Draws undergoes rigorous background and business checks to ensure your competitions are secure, fair, and legally compliant.
            </p>
          </div>
          
          <VerifiedHostsList hosts={verifiedHosts} />
        </div>
      </main>
      <WebsiteFooter />
    </>
  );
}
