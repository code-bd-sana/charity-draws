import React from "react";

/**
 * Standard Contact Page Hero component matching the Figma layouts.
 */
export default function ContactHero() {
  return (
    <section className="relative w-full bg-transparent pt-12 md:pt-16 pb-12 border-b border-divider select-none">
      <div className="container-custom flex flex-col items-center text-center relative z-10">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center bg-accent-bg border border-border px-3.5 py-1.5 rounded-badge text-[11px] font-semibold uppercase tracking-wider text-text-brand mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
          GET IN TOUCH
        </div>

        {/* Title */}
        <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-tight tracking-tight mb-3">
          Get in{" "}
          <span className="text-text-brand bg-gradient-to-r from-primary to-[#8A46E4] bg-clip-text text-transparent">
            Touch
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="font-sans text-sm sm:text-base md:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto font-medium">
          Questions about a draw, payment, or hosting? We&apos;re here to help.
        </p>

      </div>
    </section>
  );
}
