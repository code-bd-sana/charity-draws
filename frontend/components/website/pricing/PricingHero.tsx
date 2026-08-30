"use client";

import React, { useState } from "react";
import { BillingCycle } from "../../../types/pricing.types";
import PricingPlanGrid from "./PricingPlanGrid";
import { cn } from "../../../lib/utils";

/**
 * Pricing hero section with billing toggle (monthly/yearly) and pricing plan cards.
 */
export default function PricingHero() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <section className="relative w-full bg-transparent pt-12 md:pt-16 pb-20 md:pb-28 border-b border-divider select-none">
      <div className="container-custom relative flex flex-col items-center z-10">
        
        {/* Host Badge Label */}
        <div className="inline-flex items-center bg-accent-bg border border-border px-3.5 py-1.5 rounded-badge text-[11px] font-semibold uppercase tracking-wider text-text-brand mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
          FOR HOSTS
        </div>

        {/* Hero Headers */}
        <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-tight text-center tracking-tight mb-4 max-w-3xl">
          Choose Your{" "}
          <span className="text-text-brand bg-gradient-to-r from-primary to-[#8A46E4] bg-clip-text text-transparent">
            Hosting Plan
          </span>
        </h1>
        
        <p className="font-sans text-sm sm:text-base md:text-lg text-text-muted text-center mb-8 max-w-xl font-medium">
          Start free, upgrade as you grow. Transparent pricing with no hidden fees.
        </p>

        {/* Custom Toggle Billing Switcher Capsule */}
        <div className="bg-surface border border-border rounded-badge p-1.5 flex items-center gap-1.5 w-fit mb-16 select-none shadow-card hover:border-border-medium transition-all max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "rounded-badge px-6 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer select-none",
              billingCycle === "monthly"
                ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
                : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
            )}
          >
            Monthly
          </button>
          
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "rounded-badge px-6 py-2.5 font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer select-none flex items-center gap-2",
              billingCycle === "yearly"
                ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
                : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
            )}
          >
            <span>Yearly</span>
            <span className={cn(
              "text-[9px] px-2 py-0.5 rounded-badge font-bold uppercase tracking-wide border",
              billingCycle === "yearly"
                ? "bg-primary-text text-primary border-primary-text"
                : "bg-accent-bg text-text-brand border-border/50"
            )}>
              save 20%
            </span>
          </button>
        </div>

        {/* Render Plans Grid */}
        <PricingPlanGrid billingCycle={billingCycle} />

      </div>
    </section>
  );
}
