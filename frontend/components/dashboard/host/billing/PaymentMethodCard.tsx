"use client";

import React from "react";

export default function PaymentMethodCard() {
  return (
    <div className="w-full bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card">
      
      <h3 className="font-heading font-bold text-base md:text-lg text-text-primary">
        Payment Method
      </h3>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Card Details */}
        <div className="flex items-center gap-4">
          {/* Card Icon Container */}
          <div className="w-12 h-8 bg-accent-bg border border-border-medium rounded-button flex items-center justify-center text-primary shadow-sm shrink-0">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="font-sans font-bold text-sm md:text-base text-text-primary tracking-widest">
              **** **** **** 4242
            </span>
            <span className="font-sans text-xs text-text-muted font-medium">
              Expires 12/26
            </span>
          </div>
        </div>

        {/* Action */}
        <button className="h-10 px-5 bg-bg border border-border hover:bg-accent-bg/50 rounded-button font-sans font-semibold text-xs md:text-sm text-text-primary transition-all shrink-0 w-fit cursor-pointer">
          Update Card
        </button>

      </div>
      
    </div>
  );
}
