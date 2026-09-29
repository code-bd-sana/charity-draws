"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useUserDashboardQuery } from "../../../hooks/useUserHooks";

const TIMEFRAMES = ["7D", "1M", "3M", "1Y"] as const;
type Timeframe = typeof TIMEFRAMES[number];

export default function UserDashboardPage() {
  const { data, isLoading, isError } = useUserDashboardQuery();

  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("1M");

  // Compute Chart Data based on user's real transactions and selected timeframe
  const { chartData, timeframeSpent, trendPercent } = useMemo(() => {
    const transactions = data?.transactions || [];
    const now = new Date();

    if (activeTimeframe === "7D") {
      const days: { dateStr: string; label: string; amount: number; tickets: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = format(d, "yyyy-MM-dd");
        const label = format(d, "EEE");
        const dayTxs = transactions.filter((t) => format(new Date(t.date), "yyyy-MM-dd") === dateStr);
        const amount = dayTxs.reduce((sum, t) => sum + t.amount, 0);
        days.push({ dateStr, label, amount, tickets: dayTxs.length });
      }
      const total = days.reduce((sum, d) => sum + d.amount, 0);
      return { chartData: days, timeframeSpent: total, trendPercent: total > 0 ? 10 : 0 };
    }

    if (activeTimeframe === "1M") {
      const days: { dateStr: string; label: string; amount: number; tickets: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = format(d, "yyyy-MM-dd");
        // Show day label on intervals for cleaner axis
        const label = i % 5 === 0 ? format(d, "d MMM") : "";
        const dayTxs = transactions.filter((t) => format(new Date(t.date), "yyyy-MM-dd") === dateStr);
        const amount = dayTxs.reduce((sum, t) => sum + t.amount, 0);
        days.push({ dateStr, label, amount, tickets: dayTxs.length });
      }
      const total = days.reduce((sum, d) => sum + d.amount, 0);
      return {
        chartData: days,
        timeframeSpent: total,
        trendPercent: data?.kpi.spendChangePercentage ?? 0,
      };
    }

    if (activeTimeframe === "3M") {
      // 12 weeks
      const weeks: { dateStr: string; label: string; amount: number; tickets: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const startWeek = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const endWeek = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const label = format(endWeek, "d MMM");
        const weekTxs = transactions.filter((t) => {
          const tDate = new Date(t.date);
          return tDate >= startWeek && tDate < endWeek;
        });
        const amount = weekTxs.reduce((sum, t) => sum + t.amount, 0);
        weeks.push({ dateStr: label, label, amount, tickets: weekTxs.length });
      }
      const total = weeks.reduce((sum, w) => sum + w.amount, 0);
      return { chartData: weeks, timeframeSpent: total, trendPercent: total > 0 ? 8 : 0 };
    }

    // 1Y: 12 months
    const months: { dateStr: string; label: string; amount: number; tickets: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = format(d, "MMM");
      const monthTxs = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate >= d && tDate < nextMonth;
      });
      const amount = monthTxs.reduce((sum, t) => sum + t.amount, 0);
      months.push({ dateStr: label, label, amount, tickets: monthTxs.length });
    }
    const total = months.reduce((sum, m) => sum + m.amount, 0);
    return { chartData: months, timeframeSpent: total, trendPercent: total > 0 ? 12 : 0 };
  }, [data?.transactions, data?.kpi.spendChangePercentage, activeTimeframe]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-fadeIn select-none p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-card p-5 h-28 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <div className="xl:col-span-3 bg-surface border border-border rounded-card p-6 h-80 animate-pulse" />
          <div className="xl:col-span-2 bg-surface border border-border rounded-card p-6 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500 bg-surface border border-border rounded-card">
        Failed to load dashboard overview. Please refresh.
      </div>
    );
  }

  const kpi = data?.kpi || {
    totalTickets: 0,
    ticketsThisMonth: 0,
    activeEntriesCount: 0,
    activeTicketsCount: 0,
    totalWins: 0,
    newWinsThisMonth: 0,
    totalSpent: 0,
    spentThisMonth: 0,
    spendChangePercentage: 0,
  };

  const activeEntries = data?.activeEntries || [];
  const recentWins = data?.recentWins || [];

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
        {/* Total Tickets */}
        <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-3 shadow-card hover:border-border-medium hover:shadow-glow transition-all">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Total Tickets
          </p>
          <p className="font-heading font-bold text-[28px] leading-tight text-text-primary">
            {kpi.totalTickets}
          </p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 w-fit shadow-sm">
            <span className="font-sans text-[10px] font-semibold text-emerald-700">
              {kpi.ticketsThisMonth > 0
                ? `▲ ${kpi.ticketsThisMonth} this month`
                : `${kpi.totalTickets} lifetime`}
            </span>
          </div>
        </div>

        {/* Active Entries */}
        <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-3 shadow-card hover:border-border-medium hover:shadow-glow transition-all">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Active Entries
          </p>
          <p className="font-heading font-bold text-[28px] leading-tight text-text-primary">
            {kpi.activeEntriesCount}
          </p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-badge bg-accent-bg border border-border-medium w-fit shadow-sm">
            <span className="font-sans text-[10px] font-semibold text-text-brand">
              {kpi.activeTicketsCount} ticket{kpi.activeTicketsCount === 1 ? "" : "s"} awaiting draw
            </span>
          </div>
        </div>

        {/* Won Competitions */}
        <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-3 shadow-card hover:border-border-medium hover:shadow-glow transition-all">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Won Competitions
          </p>
          <p className="font-heading font-bold text-[28px] leading-tight text-text-primary">
            {kpi.totalWins}
          </p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 w-fit shadow-sm">
            <span className="font-sans text-[10px] font-semibold text-emerald-700">
              {kpi.newWinsThisMonth > 0
                ? `▲ ${kpi.newWinsThisMonth} new this month`
                : `${kpi.totalWins} total wins`}
            </span>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-surface border border-border rounded-card p-5 flex flex-col gap-3 shadow-card hover:border-border-medium hover:shadow-glow transition-all">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Total Spent
          </p>
          <p className="font-heading font-bold text-[28px] leading-tight text-text-brand">
            £{(kpi.totalSpent || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-badge bg-bg border border-divider w-fit">
            <span className="font-sans text-[10px] font-medium text-text-muted">
              Lifetime spend
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Ticket Spend Overview Chart */}
      <div className="w-full bg-surface border border-border rounded-card p-6 flex flex-col min-h-[360px] shadow-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 sm:gap-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="font-heading font-bold text-[32px] text-text-primary leading-none">
                £{timeframeSpent.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-badge bg-emerald-50 border border-emerald-200 shadow-sm">
                <span className="font-sans text-[11px] font-semibold text-emerald-700">
                  {trendPercent > 0 ? `▲ ${trendPercent}%` : `▲ Live`}
                </span>
              </div>
            </div>
            <span className="font-sans text-[13px] text-text-muted font-medium mt-1">
              Ticket Spend Overview ({activeTimeframe})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {TIMEFRAMES.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveTimeframe(filter)}
                className={`px-3 py-1 rounded-badge border font-sans text-[11px] transition-all cursor-pointer ${
                  activeTimeframe === filter
                    ? "border-primary bg-primary font-bold text-white shadow-sm"
                    : "border-border text-text-muted hover:text-text-primary hover:bg-accent-bg font-semibold"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex-1 w-full relative min-h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7131C8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7131C8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8899A6", fontSize: 11, fontFamily: "Inter" }}
                dy={5}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8899A6", fontSize: 11, fontFamily: "Inter" }}
                tickFormatter={(val) => `£${val}`}
              />
              <Tooltip
                cursor={{ stroke: "#CDAFEA", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-surface border border-border-medium rounded-button p-2.5 shadow-lg text-xs font-sans">
                        <p className="font-semibold text-text-primary">{item.dateStr || item.label}</p>
                        <p className="text-primary font-bold mt-1">
                          Spend: £{Number(item.amount).toFixed(2)}
                        </p>
                        {item.tickets !== undefined && (
                          <p className="text-text-muted text-[11px]">
                            Tickets: {item.tickets}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#7131C8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#spendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Active Entries & Recent Wins */}
      <div className="flex flex-col xl:flex-row gap-5 w-full">
        {/* My Active Entries */}
        <div className="flex-[3] bg-surface border border-border rounded-card p-6 flex flex-col shadow-card">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-[16px] text-text-primary">
                My Active Entries
              </h3>
              {activeEntries.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {activeEntries.length}
                </span>
              )}
            </div>
            <Link
              href="/dashboard/user/tickets"
              className="flex items-center gap-1 font-sans font-semibold text-[13px] text-text-brand hover:underline transition-all cursor-pointer"
            >
              View All
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>

          {activeEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 gap-3 min-h-[220px]">
              <div className="w-12 h-12 bg-accent-bg rounded-full border border-border-medium flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                </svg>
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-text-primary">No active entries</h4>
                <p className="font-sans text-xs text-text-muted mt-0.5">
                  You are not currently entered in any active competitions.
                </p>
              </div>
              <Link
                href="/live-raffles"
                className="mt-1 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-text rounded-button text-xs font-sans font-bold transition-all shadow-sm"
              >
                Browse Live Competitions
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* List Header */}
              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-border font-sans text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <div className="col-span-6">Competition</div>
                <div className="col-span-3">Draw Date</div>
                <div className="col-span-3 text-right">Tickets</div>
              </div>

              {/* List Items */}
              {activeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-12 gap-4 py-3.5 border-b border-divider items-center hover:bg-accent-bg/30 transition-colors rounded-button px-1"
                >
                  <div className="col-span-6 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-button bg-accent-bg border border-border-medium flex items-center justify-center shrink-0 overflow-hidden relative">
                      {entry.image ? (
                        <Image
                          src={entry.image}
                          alt={entry.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <Link
                        href={`/live-raffles/${entry.slug || entry.id}`}
                        className="font-sans text-[14px] font-semibold text-text-primary truncate hover:text-primary transition-colors"
                      >
                        {entry.title}
                      </Link>
                      <span className="font-sans text-[12px] text-text-muted font-medium truncate">
                        Hosted by {entry.hostName}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center">
                    <span className="font-sans text-[13px] text-text-muted font-medium">
                      {entry.drawDate
                        ? format(new Date(entry.drawDate), "dd MMM yyyy")
                        : "TBA"}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center justify-end">
                    <div className="px-2.5 py-1 bg-accent-bg border border-border-medium rounded-badge shadow-sm">
                      <span className="font-sans text-[13px] font-bold text-text-brand">
                        {entry.ticketCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Wins */}
        <div className="flex-[2] bg-surface border border-border rounded-card p-6 flex flex-col shadow-card">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-[16px] text-text-primary">
                Recent Wins
              </h3>
              {recentWins.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {recentWins.length}
                </span>
              )}
            </div>
            <Link
              href="/dashboard/user/winners"
              className="flex items-center gap-1 font-sans font-semibold text-[13px] text-text-brand hover:underline transition-all cursor-pointer"
            >
              View All
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>

          <div className="flex flex-col h-full justify-center min-h-[220px]">
            {recentWins.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-14 h-14 bg-accent-bg rounded-full border border-border-medium flex items-center justify-center mb-3 shadow-sm">
                  <svg className="w-7 h-7 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                  </svg>
                </div>
                <h4 className="font-sans font-bold text-[14px] text-text-primary mb-1">
                  No wins just yet
                </h4>
                <p className="font-sans text-[12px] text-text-muted font-medium max-w-[220px]">
                  Enter competitions for a chance to win verified prizes.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-divider">
                {recentWins.map((win) => (
                  <div key={win.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-button bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg shrink-0 overflow-hidden relative">
                        {win.image ? (
                          <Image src={win.image} alt={win.prizeName} fill className="object-cover" />
                        ) : (
                          "🏆"
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-sans text-[13px] font-bold text-text-primary truncate">
                          {win.prizeName}
                        </span>
                        <span className="font-sans text-[11px] text-text-muted truncate">
                          {win.raffleTitle} • Ticket #{win.ticketNumber || "Win"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {win.winType === "INSTANT_WIN" ? "Instant Win" : "Main Draw"}
                      </span>
                      <span className="font-sans text-[10px] text-text-muted mt-1">
                        {format(new Date(win.createdAt), "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
