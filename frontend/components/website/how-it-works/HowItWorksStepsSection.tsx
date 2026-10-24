"use client";

import React, { useState } from "react";
import { entrantSteps, charitySteps, promoterSteps } from "../../../data/how-it-works/how-it-works-steps.data";
import { cn } from "../../../lib/utils";

/**
 * Interactive steps section allowing toggling between Entrants, Registered Charities, and Promoters.
 * Renders a responsive vertical timeline with circles and connecting vertical lines.
 */
export default function HowItWorksStepsSection() {
  const [activeTab, setActiveTab] = useState<"entrants" | "charities" | "promoters">("entrants");

  const getSteps = () => {
    switch (activeTab) {
      case "charities":
        return charitySteps;
      case "promoters":
        return promoterSteps;
      default:
        return entrantSteps;
    }
  };

  const steps = getSteps();

  return (
    <section className="py-16 md:py-24 bg-transparent select-none">
      <div className="container-custom">
        {/* Tab Swapper Segment Capsule */}
        <div className="flex flex-col items-center justify-center mb-16 gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <span>Select Your Journey</span>
            <span>•</span>
            <span className="text-text-brand">Host A Draw Options Included</span>
          </div>

          <div className="bg-surface border border-border p-1.5 rounded-badge flex flex-wrap gap-1.5 items-center justify-center select-none shadow-card hover:border-border-medium transition-all max-w-2xl mx-auto">
            <button
              onClick={() => setActiveTab("entrants")}
              className={cn(
                "px-5 py-2.5 rounded-badge font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer select-none",
                activeTab === "entrants"
                  ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
                  : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
              )}
            >
              I Want to Enter Draws
            </button>
            <button
              onClick={() => setActiveTab("charities")}
              className={cn(
                "px-5 py-2.5 rounded-badge font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer select-none",
                activeTab === "charities"
                  ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
                  : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
              )}
            >
              We Are a Registered Charity
            </button>
            <button
              onClick={() => setActiveTab("promoters")}
              className={cn(
                "px-5 py-2.5 rounded-badge font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer select-none",
                activeTab === "promoters"
                  ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
                  : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
              )}
            >
              Promoter (Host A Draw)
            </button>
          </div>
        </div>

        {/* Timeline Layout */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative pl-14 sm:pl-20">
            {/* Connecting Vertical Line */}
            <div className="absolute left-[27px] sm:left-[27px] top-[28px] bottom-[28px] w-0.5 bg-gradient-to-b from-primary via-primary/40 to-border" />

            {/* List of Timeline Steps */}
            <div className="flex flex-col gap-8 sm:gap-10">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-start group"
                >
                  {/* Circular Number Indicator */}
                  <div className="absolute left-[-56px] sm:left-[-80px] z-10 flex-shrink-0 w-14 h-14 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center font-heading text-lg font-bold text-text-brand select-none group-hover:border-primary group-hover:bg-primary group-hover:text-primary-text shadow-sm transition-all duration-300">
                    {String(step.stepNumber).padStart(2, "0")}
                  </div>

                  {/* Step Description Card */}
                  <div className="w-full bg-surface border border-border rounded-card p-6 sm:p-8 hover:border-border-medium transition-all duration-300 shadow-card hover:shadow-glow group-hover:translate-x-1">
                    <h3 className="font-heading font-bold text-lg md:text-xl text-text-primary group-hover:text-text-brand transition-colors duration-200 mb-2">
                      {step.title}
                    </h3>
                    <p className="font-sans text-xs md:text-sm text-text-muted leading-relaxed max-w-[933px]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
