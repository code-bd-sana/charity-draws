"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RaffleDetail, RaffleTabId, RaffleTab } from "../../../types/raffle-details.types";
import { formatCurrency } from "../../../lib/utils";
import { cn } from "../../../lib/utils";
import { useAuth } from "../../../features/auth/AuthContext";

interface RaffleDetailsTabsProps {
  raffle: RaffleDetail;
}

export default function RaffleDetailsTabs({ raffle }: RaffleDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<RaffleTabId>("details");
  const { user } = useAuth();

  const tabs: RaffleTab[] = [
    { id: "details", label: "Description" },
    { id: "how-to-enter", label: "How to Enter" },
    { id: "terms", label: "Terms" },
  ];

  const checkIcon = (
    <div className="w-6 h-6 rounded-full bg-[#F3E8FF] border border-[#D8B4FE] flex items-center justify-center shrink-0">
      <svg className="w-3.5 h-3.5 text-[#7131C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  );

  return (
    <div className="w-full flex flex-col font-sans mt-2">
      {/* Tabs Header */}
      <div className="flex items-center gap-6 border-b border-[#E9D5FF] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-3 text-xs sm:text-sm font-bold transition-colors duration-200 border-b-2 -mb-[1px] cursor-pointer",
              activeTab === tab.id
                ? "border-[#7131C8] text-[#7131C8]"
                : "border-transparent text-[#6B7280] hover:text-[#7131C8]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[160px]">
        {activeTab === "details" && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <p className="text-sm text-[#4B5563] leading-relaxed">
              {raffle.description}
            </p>
            {raffle.highlights.length > 0 && (
              <ul className="flex flex-col gap-2.5 mt-2">
                {raffle.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2E0B57] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#7131C8] mt-1.5 shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "how-to-enter" && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="flex gap-4 items-start">
              <div className="bg-[#F3E8FF] border border-[#D8B4FE] w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-[#7131C8] text-xs">
                1
              </div>
              <div>
                <h4 className="font-heading font-bold text-[#2E0B57] text-sm">Select your tickets</h4>
                <p className="text-xs text-[#6B7280] mt-0.5">Choose how many tickets you&apos;d like to purchase. More tickets = more chances to win.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-[#F3E8FF] border border-[#D8B4FE] w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-[#7131C8] text-xs">
                2
              </div>
              <div>
                <h4 className="font-heading font-bold text-[#2E0B57] text-sm">Complete checkout</h4>
                <p className="text-xs text-[#6B7280] mt-0.5">Pay securely via card (Cashflows). Free postal entry also available — see T&Cs.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-[#F3E8FF] border border-[#D8B4FE] w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-[#7131C8] text-xs">
                3
              </div>
              <div>
                <h4 className="font-heading font-bold text-[#2E0B57] text-sm">Instant win check</h4>
                <p className="text-xs text-[#6B7280] mt-0.5">Your ticket numbers are checked against instant win outcomes automatically. If you win, you&apos;ll know straight away.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-[#F3E8FF] border border-[#D8B4FE] w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-heading font-bold text-[#7131C8] text-xs">
                4
              </div>
              <div>
                <h4 className="font-heading font-bold text-[#2E0B57] text-sm">Watch the live draw</h4>
                <p className="text-xs text-[#6B7280] mt-0.5">The main draw goes live on the draw end date. Watch live draw updates on our site.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "terms" && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            <p className="text-xs text-[#6B7280] mb-2 font-medium">Please read the terms carefully before entering.</p>
            <ul className="flex flex-col gap-2.5">
              {raffle.terms.map((term, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-[#4B5563] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7131C8] mt-1.5 shrink-0" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Instant Win Prizes */}
      {raffle.instantWinPrizes.length > 0 && (
        <div className="mt-8 bg-white border border-[#E9D5FF] rounded-[24px] p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎁</span>
            <h3 className="font-heading font-bold text-sm text-[#2E0B57]">Instant Win Prizes</h3>
          </div>
          <div className="flex flex-col gap-3">
            {raffle.instantWinPrizes.map((prize) => (
              <div key={prize.id} className="flex items-center justify-between p-4 bg-[#FBF8FF] border border-[#F0E6FF] rounded-2xl">
                <div className="flex items-center gap-3">
                  {prize.image ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white border border-[#E9D5FF]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={prize.image} alt={prize.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    checkIcon
                  )}
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-xs text-[#2E0B57]">{prize.title}</span>
                    <span className="font-sans text-[11px] text-[#6B7280]">
                      {user?.role === 'ADMIN' || user?.role === 'HOST' ? `Ticket #${prize.ticketNumber}` : "Ticket #???"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className={cn("font-heading font-bold text-xs px-3 py-1 rounded-full", prize.isClaimed ? "bg-[#F3F4F6] text-[#9CA3AF]" : "bg-[#F3E8FF] text-[#7131C8] border border-[#D8B4FE]")}>
                    {prize.isClaimed ? "Claimed" : "Available"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Host Profile Banner */}
      {raffle.hostName && (
        <div className="mt-8 bg-gradient-to-r from-[#FAF5FF] via-[#F5EDFF] to-[#FAF5FF] border border-[#E9D5FF] rounded-[24px] p-5 sm:p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full border-2 border-[#7131C8] bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              {raffle.hostLogo && (raffle.hostLogo.startsWith('http') || raffle.hostLogo.startsWith('/') || raffle.hostLogo.startsWith('data:') || raffle.hostLogo.includes('/uploads/')) ? (
                <img
                  src={
                    raffle.hostLogo.startsWith('http') || raffle.hostLogo.startsWith('/') || raffle.hostLogo.startsWith('data:')
                      ? raffle.hostLogo
                      : `/${raffle.hostLogo}`
                  }
                  alt={raffle.hostName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-heading font-extrabold text-[#7131C8] text-sm">
                  {raffle.hostName ? raffle.hostName.substring(0, 2).toUpperCase() : 'H'}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Hosted by</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-heading font-bold text-sm text-[#2E0B57]">{raffle.hostName}</span>
                {raffle.hostVerified && (
                  <span className="bg-[#7131C8] text-white px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide shadow-xs">Verified</span>
                )}
              </div>
            </div>
          </div>
          <Link 
            href={`/hosts/${raffle.hostName.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-xs font-sans font-bold text-[#7131C8] hover:text-[#5B20B5] transition-colors"
          >
            View Host Profile &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
