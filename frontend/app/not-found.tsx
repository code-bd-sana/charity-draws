import React from "react";
import Link from "next/link";
import WebsiteNavbar from "../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../components/website/layout/WebsiteFooter";

const quickLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/winners", label: "Past Winners" },
  { href: "/pricing", label: "Pricing & FAQ" },
  { href: "/contact", label: "Contact Support" },
];

export default function NotFound() {
  return (
    <>
      <WebsiteNavbar />

      <main className="relative flex min-h-screen flex-col overflow-hidden bg-surface pb-12 pt-20 lg:pt-[66px]">
        <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-primary/15 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-15%] right-[-10%] h-[45%] w-[45%] rounded-full bg-success/10 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(113,49,200,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,49,200,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_70%_at_50%_45%,#000_20%,transparent_100%)]" />

        <section className="container-custom relative z-10 my-auto flex flex-1 items-center justify-center py-16 text-center sm:py-20">
          <div className="w-full max-w-3xl">
            <div className="relative mb-8 inline-flex items-center justify-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-border bg-accent-bg text-primary shadow-glow sm:h-32 sm:w-32">
                <svg
                  aria-hidden="true"
                  className="h-14 w-14 sm:h-16 sm:w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <circle cx="12" cy="12" r="8.5" strokeDasharray="3 3" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <path strokeLinecap="round" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                </svg>
              </div>
              <span className="absolute -bottom-3 rounded-badge border border-border-medium bg-surface px-3 py-1 font-sans text-xs font-bold uppercase tracking-widest text-text-brand shadow-card">
                Error 404
              </span>
            </div>

            <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Page not found
            </h1>
            <p className="mx-auto mb-9 max-w-xl font-sans text-base leading-relaxed text-text-secondary sm:text-lg">
              The page or competition you&apos;re looking for may have moved, expired, or no longer exists.
            </p>

            <div className="mb-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-button bg-primary px-6 py-3 font-sans text-sm font-semibold text-primary-text shadow-glow transition-all duration-200 hover:bg-primary-hover sm:w-auto"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to homepage
              </Link>
              <Link
                href="/live-raffles"
                className="inline-flex w-full items-center justify-center gap-2 rounded-button border border-border bg-surface px-6 py-3 font-sans text-sm font-semibold text-text-primary shadow-card transition-all duration-200 hover:border-border-medium hover:bg-accent-bg sm:w-auto"
              >
                Explore live raffles
              </Link>
            </div>

            <div className="rounded-card border border-border bg-surface p-5 shadow-card sm:p-6">
              <p className="mb-4 font-heading text-xs font-bold uppercase tracking-wider text-text-brand">
                Quick navigation
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-button border border-border bg-bg px-3 py-3 font-sans text-xs font-medium text-text-secondary transition-colors duration-200 hover:border-border-medium hover:bg-accent-bg hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </>
  );
}
