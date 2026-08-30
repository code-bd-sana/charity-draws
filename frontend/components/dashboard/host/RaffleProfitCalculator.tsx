"use client";

import React, { useState } from "react";
import { cn } from "../../../lib/utils";

export default function RaffleProfitCalculator() {
  const [ticketPrice, setTicketPrice] = useState("5");
  const [totalTickets, setTotalTickets] = useState("500");
  const [costOfPrize, setCostOfPrize] = useState("350");
  const [commissionRate, setCommissionRate] = useState("10");

  const [grossRevenue, setGrossRevenue] = useState<number | null>(null);
  const [netProfit, setNetProfit] = useState<number | null>(null);

  const handleCalculate = () => {
    const price = parseFloat(ticketPrice) || 0;
    const tickets = parseFloat(totalTickets) || 0;
    const prize = parseFloat(costOfPrize) || 0;
    const commission = parseFloat(commissionRate) || 0;

    const gross = price * tickets;
    const commissionAmount = gross * (commission / 100);
    const net = gross - prize - commissionAmount;

    setGrossRevenue(gross);
    setNetProfit(net);
  };

  return (
    <div className="bg-surface border border-border rounded-card p-6 w-full flex flex-col gap-4 min-h-[362px] shadow-card select-none">
      <div className="w-full">
        <h2 className="font-heading font-bold text-base md:text-lg text-text-primary">
          Raffle Profit Calculator
        </h2>
      </div>

      <div className="w-full flex flex-col gap-3">
        {/* Row 1 */}
        <div className="flex gap-3 items-center">
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-sans font-semibold text-xs text-text-secondary">
              Ticket Price (£)
            </label>
            <input
              type="text"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              className="bg-bg border border-border rounded-button h-10 px-3 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-sans font-semibold text-xs text-text-secondary">
              Total Tickets
            </label>
            <input
              type="text"
              value={totalTickets}
              onChange={(e) => setTotalTickets(e.target.value)}
              className="bg-bg border border-border rounded-button h-10 px-3 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex gap-3 items-center">
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-sans font-semibold text-xs text-text-secondary">
              Cost of Prize (£)
            </label>
            <input
              type="text"
              value={costOfPrize}
              onChange={(e) => setCostOfPrize(e.target.value)}
              className="bg-bg border border-border rounded-button h-10 px-3 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-sans font-semibold text-xs text-text-secondary">
              Commission Rate (%)
            </label>
            <input
              type="text"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="bg-bg border border-border rounded-button h-10 px-3 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full bg-primary hover:bg-primary-hover text-primary-text font-heading font-semibold text-xs md:text-sm transition-all h-11 rounded-button flex items-center justify-center shrink-0 mt-1 shadow-glow cursor-pointer"
      >
        Calculate Projected Profit
      </button>

      <div className="border-t border-divider mt-auto pt-3 flex gap-4 items-center">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-sans font-medium text-xs text-text-muted">
            Gross Revenue
          </span>
          <span className="font-heading font-bold text-base md:text-lg text-text-primary">
            {grossRevenue !== null ? `£${grossRevenue.toLocaleString()}` : "—"}
          </span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-sans font-medium text-xs text-text-muted">
            Est. Net Profit
          </span>
          <span className="font-heading font-bold text-lg md:text-xl text-text-brand">
            {netProfit !== null ? `£${netProfit.toLocaleString()}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
