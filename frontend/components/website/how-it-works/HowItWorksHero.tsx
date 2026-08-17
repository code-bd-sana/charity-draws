import React from "react";

/**
 * Hero Banner component for the stand-alone 'How It Works' page.
 * Features a dark elevated background matching Figma styling.
 */
export default function HowItWorksHero() {
  return (
    <section className="relative pt-12 md:pt-16 pb-12 border-b border-divider select-none">
      <div className="container-custom flex flex-col items-center text-center mx-auto relative z-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center bg-accent-bg border border-border px-3.5 py-1.5 rounded-badge text-[11px] font-semibold uppercase tracking-wider text-text-brand mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
          SIMPLE & TRANSPARENT
        </div>

        {/* Heading */}
        <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-text-primary tracking-tight leading-tight max-w-4xl mx-auto">
          How Charity Draws{" "}
          <span className="text-text-brand bg-gradient-to-r from-primary to-[#8A46E4] bg-clip-text text-transparent">
            Works
          </span>
        </h1>

        {/* Description */}
        <p className="font-sans text-sm sm:text-base md:text-lg text-text-muted max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
          Whether you&apos;re entering a draw for premium charity gear or hosting your own draw, here&apos;s everything you need to know.
        </p>
      </div>
    </section>
  );
}
