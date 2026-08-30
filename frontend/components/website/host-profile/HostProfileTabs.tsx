"use client";

import React, { useState } from "react";
import DrawCard from "../shared/DrawCard";

export default function HostProfileTabs({ raffles = [] }: { raffles?: any[] }) {
  const [activeTab, setActiveTab] = useState<"active" | "past" | "reviews" | "about">("active");

  const liveDraws = raffles.filter(r => r.status === 'ACTIVE');
  const pastDraws = raffles.filter(r => r.status === 'ENDED' || r.status === 'COMPLETED');

  return (
    <div className="flex flex-col mt-8 select-none">
      {/* Tabs Row */}
      <div className="flex items-center gap-8 border-b border-border mb-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 text-[14px] font-semibold transition-colors border-b-[2px] -mb-[1px] whitespace-nowrap cursor-pointer ${
            activeTab === "active" 
              ? "border-primary text-text-brand font-bold" 
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Active Draws
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`pb-4 text-[14px] font-semibold transition-colors border-b-[2px] -mb-[1px] whitespace-nowrap cursor-pointer ${
            activeTab === "past" 
              ? "border-primary text-text-brand font-bold" 
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Past Draws
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-4 text-[14px] font-semibold transition-colors border-b-[2px] -mb-[1px] whitespace-nowrap cursor-pointer ${
            activeTab === "reviews" 
              ? "border-primary text-text-brand font-bold" 
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Reviews
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`pb-4 text-[14px] font-semibold transition-colors border-b-[2px] -mb-[1px] whitespace-nowrap cursor-pointer ${
            activeTab === "about" 
              ? "border-primary text-text-brand font-bold" 
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          About
        </button>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {activeTab === "active" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {liveDraws.length > 0 ? (
              liveDraws.map((draw) => (
                <DrawCard key={draw.id} draw={draw} />
              ))
            ) : (
              <p className="text-text-muted col-span-full py-10 text-center font-medium">No active draws at the moment.</p>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {pastDraws.length > 0 ? (
              pastDraws.map((draw) => (
                <DrawCard key={draw.id} draw={draw} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3 w-full col-span-full">
                <span className="text-[32px]">🏆</span>
                <h3 className="font-heading font-bold text-[18px] text-text-primary">No Past Draws</h3>
                <p className="font-sans text-[13px] text-text-muted max-w-[300px]">
                  This host hasn't completed any draws yet. Check back later to see their history of winners!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3 animate-in fade-in duration-300">
            <span className="text-[32px]">⭐</span>
            <h3 className="font-heading font-bold text-[18px] text-text-primary">Host Reviews</h3>
            <p className="font-sans text-[13px] text-text-muted max-w-[300px]">
              Reviews are left by verified ticket buyers after a draw completes.
            </p>
          </div>
        )}

        {activeTab === "about" && (
          <div className="animate-in fade-in duration-300 flex flex-col gap-4 max-w-[800px]">
            <h3 className="font-heading font-bold text-[18px] text-text-primary">About Host</h3>
            <p className="font-sans text-[14px] text-text-muted leading-relaxed font-medium">
              We are a verified charity host organization. Our competitions give you the chance to win top-tier prizes for a fraction of the cost, fully audited and guaranteed.
            </p>
            <div className="flex gap-4 mt-2">
              <span className="font-sans text-[13px] text-text-brand font-semibold">📍 Verified UK Partner</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
