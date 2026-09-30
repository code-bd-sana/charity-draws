import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";

export const metadata: Metadata = {
  title: "Host Rules & Compliance Guidelines | Charity Draws",
  description:
    "Official operational rules, regulatory standards, and compliance guidelines for verified hosts and charity partners on Charity Draws.",
};

const hostRules = [
  {
    number: "01",
    title: "Prize Authenticity & UK Compliance",
    badge: "100% Genuine & Brand New",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    description:
      "All items offered as prizes must be authentic, legally sourced, exactly as described in the competition listing, and meet all UK safety and compliance standards. Physical prizes must be brand new and unused with full manufacturer warranties where applicable (luxury watches must include original box & papers, vehicles must have full UK registration, MOT, and inspection reports).",
    highlights: ["Brand New & Legally Sourced", "Authenticity Guaranteed", "UK Safety & Quality Compliant", "Full Manufacturer Warranty"],
  },
  {
    number: "02",
    title: "Certified Random Draws & Live Transparency",
    badge: "Official Certified System",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    description:
      "All competition draws are conducted transparently using Charity Draws automated cryptographically secure random number generator or our certified lottery ball machine. Winners are automatically recorded in permanent public draw logs. Live draws are broadcast on official Charity Draws channels and archived permanently for replay audit verification.",
    highlights: ["Certified Random Draw System", "Public Winner Ledger", "Live Stream Verification", "Audited Winning Number Logs"],
  },
  {
    number: "03",
    title: "Fast Track Dispatch & Insured Delivery",
    badge: "7-Day Dispatch SLA",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.75 18.75a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM3.75 6h10.334a1.5 1.5 0 011.342.832l2.67 5.341H21a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-1.05a2.25 2.25 0 00-4.4 0H8.45a2.25 2.25 0 00-4.4 0H3.75A1.5 1.5 0 012.25 17.25v-9.75A1.5 1.5 0 013.75 6z" />
      </svg>
    ),
    description:
      "Hosts are strictly required to dispatch physical prizes within 7 working days of winner verification using fully tracked and insured UK courier services (e.g. Royal Mail Special Delivery, DPD). Tracking information must be promptly updated in the Host Dashboard. Hosts bear full transit responsibility until signed delivery confirmation is obtained.",
    highlights: ["Dispatch within 7 Working Days", "Fully Insured Tracked Courier", "Free Shipping to Winner Included", "Host Transit Liability"],
  },
  {
    number: "04",
    title: "Host Payouts & Charity Allocation",
    badge: "Verified UK Accounts Only",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    description:
      "Competition payouts are transferred directly to verified UK business or charity bank accounts. Payouts are released the next working day following confirmed delivery of the prize to the verified winner. A legally transparent proportion of every draw directly funds registered UK charity causes.",
    highlights: ["Registered UK Business / Charity Account", "Next Working Day Payout", "Direct UK Charity Donation Escrow", "Transparent Settlement Breakdown"],
  },
  {
    number: "05",
    title: "Guaranteed Draws & Zero Arbitrary Extensions",
    badge: "100% Guaranteed Draw Policy",
    isWarning: true,
    icon: (
      <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.001A11.959 11.959 0 0112 2.964zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    description:
      "Once an approved competition goes live, it cannot be arbitrarily cancelled or extended. Regardless of the total tickets sold by the scheduled closing time, the full advertised prize must be awarded. This strict guaranteed draw policy upholds player trust and complies with UK consumer protection laws.",
    highlights: ["No Arbitrary Draw Extensions", "Zero Cancellations Allowed", "Guaranteed Prize Regardless of Ticket Sales", "Strict UK Consumer Protection"],
  },
  {
    number: "06",
    title: "Regulatory Compliance & Free Entry Route",
    badge: "Gambling Act 2005 Compliant",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    description:
      "All hosted prize draws must adhere strictly to the UK Gambling Act 2005 prize competition regulations, ASA CAP Code guidelines, and offer a transparent free postal entry route. Knowledge-based skill questions and transparent odds must be maintained for every participant.",
    highlights: ["UK Gambling Act 2005 Compliance", "Free Postal Entry Maintained", "Skill Question Verification", "Full ASA / CAP Code Adherence"],
  },
];

export default function HostRulesPage() {
  return (
    <>
      <WebsiteNavbar />
      <main className="flex-grow bg-bg text-text-primary pt-28 pb-24 relative overflow-hidden font-sans">
        
        {/* Subtle background ambient purple glows matching site theme */}
        <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[35%] right-[-10%] w-[450px] h-[450px] bg-accent-bg rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(113,49,200,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,49,200,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="container-custom max-w-4xl px-4 sm:px-6 relative z-10">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[12px] text-text-muted mb-6">
            <Link href="/" className="hover:text-text-brand transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-text-primary font-semibold">Host Rules & Guidelines</span>
          </div>

          {/* Hero Header Card */}
          <div className="bg-surface border border-border rounded-card p-6 sm:p-10 mb-10 shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-bg border border-border text-text-brand text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Verified Host Governance
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight mb-4 leading-tight">
              Host Rules &{" "}
              <span className="text-text-brand bg-gradient-to-r from-primary to-[#8A46E4] bg-clip-text text-transparent">
                Guidelines
              </span>
            </h1>

            <p className="font-sans text-sm sm:text-base text-text-muted leading-relaxed max-w-3xl font-medium">
              As a Verified Host on Charity Draws, you join trusted organisations, brands, and charities committed to the highest standards of transparency, integrity, and regulatory compliance. Please review our mandatory operational rules prior to creating a prize draw.
            </p>
          </div>

          {/* Rules List */}
          <div className="space-y-6">
            {hostRules.map((rule) => (
              <div
                key={rule.number}
                className={`bg-surface border rounded-card p-6 sm:p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-card shadow-sm ${
                  rule.isWarning 
                    ? "border-amber-200/90 bg-amber-50/30 hover:border-amber-300" 
                    : "border-border hover:border-border-medium"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-divider">
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      rule.isWarning 
                        ? "bg-amber-100 border border-amber-200/80 text-amber-700" 
                        : "bg-accent-bg border border-border-medium text-text-brand"
                    }`}>
                      {rule.icon}
                    </div>
                    <div>
                      <span className={`text-xs font-sans font-bold uppercase tracking-wider block ${
                        rule.isWarning ? "text-amber-800" : "text-text-brand"
                      }`}>
                        Rule {rule.number}
                      </span>
                      <h2 className="font-heading font-bold text-xl sm:text-2xl text-text-primary">
                        {rule.title}
                      </h2>
                    </div>
                  </div>

                  <span className={`self-start sm:self-auto text-xs font-sans font-semibold px-3.5 py-1.5 rounded-full border shadow-sm ${
                    rule.isWarning 
                      ? "bg-amber-100 border-amber-300/80 text-amber-900" 
                      : "bg-accent-bg border-border text-text-brand"
                  }`}>
                    {rule.badge}
                  </span>
                </div>

                <p className="font-sans text-sm sm:text-base text-text-secondary leading-relaxed mb-6">
                  {rule.description}
                </p>

                {/* Key Points Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {rule.highlights.map((item, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium border ${
                        rule.isWarning
                          ? "bg-white/90 border-amber-200 text-amber-900 shadow-sm"
                          : "bg-accent-bg/60 border-border text-text-brand"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        rule.isWarning ? "bg-amber-500" : "bg-primary"
                      }`} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Questions & Support Callout */}
          <div className="mt-12 bg-gradient-to-r from-[#2E0B57] via-primary to-[#8A46E4] text-white rounded-card p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1.5 text-center md:text-left relative z-10 max-w-xl">
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                Ready to Host a Draw for Charity?
              </h3>
              <p className="font-sans text-xs sm:text-sm text-purple-100 leading-relaxed font-normal">
                Join verified UK charity partners and enterprise hosts raising vital funds for registered charities while running fully compliant, transparent prize competitions.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0 relative z-10">
              <Link
                href="/host/register"
                className="px-6 py-3 rounded-button bg-white hover:bg-slate-50 text-text-brand font-sans font-bold text-sm transition-all shadow-md whitespace-nowrap cursor-pointer uppercase tracking-wider"
              >
                Become a Host
              </Link>
              <Link
                href="/contact"
                className="px-5 py-3 rounded-button border border-white/40 hover:bg-white/10 text-white font-sans font-semibold text-sm transition-all whitespace-nowrap cursor-pointer"
              >
                Contact Support →
              </Link>
            </div>
          </div>

        </div>
      </main>
      <WebsiteFooter />
    </>
  );
}
