"use client";

import React, { useState } from "react";
import { entrantSteps, hostSteps } from "../../../data/how-it-works/how-it-works-steps.data";
import { cn } from "../../../lib/utils";

/**
 * Interactive steps section allowing toggling between Entrant and Host guides.
 * Renders a responsive vertical timeline with circles and connecting vertical lines.
 */
export default function HowItWorksStepsSection() {
  const [activeTab, setActiveTab] = useState<"entrants" | "hosts">("entrants");

  const steps = activeTab === "entrants" ? entrantSteps : hostSteps;

  return (
    <section className="py-16 md:py-24 bg-transparent select-none">
      <div className="container-custom">
        {/* Tab Swapper Segment Capsule */}
        <div className="flex justify-center mb-16">
          <div className="bg-surface border border-border p-1.5 rounded-badge flex gap-1.5 items-center select-none shadow-card hover:border-border-medium transition-all max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("entrants")}
              className={cn(
                "flex-1 px-6 py-2.5 rounded-badge font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer select-none",
                activeTab === "entrants"
                  ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
                  : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
              )}
            >
              I Want to Enter Draws
            </button>
            <button
              onClick={() => setActiveTab("hosts")}
              className={cn(
                "flex-1 px-6 py-2.5 rounded-badge font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer select-none",
                activeTab === "hosts"
                  ? "bg-primary border-primary text-primary-text font-semibold shadow-glow"
                  : "text-text-secondary hover:text-text-primary hover:bg-accent-bg/40"
              )}
            >
              I Want to Host Draws
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
