import React from "react";
import { cn } from "../../../../lib/utils";

interface CreateRaffleStepperProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  "Basic Info",
  "Prize Details",
  "Media",
  "Ticket Settings",
  "Review & Submit",
];

export default function CreateRaffleStepper({ currentStep, totalSteps }: CreateRaffleStepperProps) {
  return (
    <div className="w-full flex items-start justify-between relative mb-8 px-4 select-none">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isPending = stepNum > currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={label}>
            {/* Step Item */}
            <div className="flex flex-col items-center gap-2.5 relative z-10 w-20 shrink-0">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-sans text-xs transition-all border shadow-sm",
                  isCompleted && "bg-accent-bg border-border-medium text-text-brand font-bold",
                  isActive && "bg-primary border-primary text-primary-text font-bold shadow-glow scale-110",
                  isPending && "bg-bg border-border text-text-muted font-medium"
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={cn(
                  "font-sans text-[11px] text-center whitespace-nowrap transition-colors",
                  (isCompleted || isActive) ? "text-text-primary font-bold" : "text-text-muted font-medium"
                )}
              >
                {stepNum}. {label}
              </span>
            </div>

            {/* Connecting Line */}
            {!isLast && (
              <div className="flex-1 h-0.5 mt-4 mx-2 shrink">
                <div 
                  className={cn(
                    "w-full h-full transition-colors",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
