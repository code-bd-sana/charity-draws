"use client";

import React, { useMemo, useState } from "react";
import { useHostSalesAnalytics } from "../../../../hooks/useHostWalletHooks";
import { HostSalesRange } from "../../../../services/host-wallet.service";
import { HostDashboardStat } from "../../../../types/host-dashboard.types";
import SalesBreakdownTable from "./SalesBreakdownTable";
import SalesChart from "./SalesChart";
import SalesMetricsCards from "./SalesMetricsCards";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function HostSalesDashboard() {
  const [range, setRange] = useState<HostSalesRange>("7d");
  const { data, isLoading, isError, refetch } = useHostSalesAnalytics(range);

  const metrics = useMemo<HostDashboardStat[]>(() => {
    const sales = data?.metrics;
    const completedOrders = sales?.completedOrders ?? 0;

    return [
      {
        id: "total-revenue",
        label: "Total Revenue",
        value: formatCurrency(sales?.totalRevenue ?? 0),
        change: "All time",
        trend: "neutral",
      },
      {
        id: "tickets-sold",
        label: "Tickets Sold",
        value: (sales?.totalTicketsSold ?? 0).toLocaleString("en-GB"),
        change: `${completedOrders.toLocaleString("en-GB")} completed orders`,
        trend: "neutral",
      },
      {
        id: "average-order-value",
        label: "Avg. Order Value",
        value: formatCurrency(sales?.averageOrderValue ?? 0),
        change: "Completed orders only",
        trend: "neutral",
      },
      {
        id: "completed-orders",
        label: "Completed Orders",
        value: completedOrders.toLocaleString("en-GB"),
        change: "All time",
        trend: "neutral",
      },
    ];
  }, [data?.metrics]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-[20px] py-[24px] animate-in fade-in zoom-in-95 duration-300 select-none lg:px-[40px] lg:py-[32px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
          Competition Sales
        </h1>
        <p className="font-sans text-xs font-medium text-text-muted md:text-sm">
          Monitor completed ticket revenue, sales, and competition performance.
        </p>
      </div>

      {isError && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-card border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
          <p className="font-sans text-sm font-medium text-red-700">
            We couldn&apos;t load your sales data. Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-button bg-primary px-4 py-2 font-sans text-xs font-semibold text-primary-text transition-colors hover:bg-primary-hover"
          >
            Try again
          </button>
        </div>
      )}

      <SalesMetricsCards metrics={metrics} isLoading={isLoading} />
      <SalesChart
        data={data?.chart.data ?? []}
        range={range}
        onRangeChange={setRange}
        isLoading={isLoading}
      />
      <SalesBreakdownTable raffles={data?.raffles ?? []} isLoading={isLoading} />
    </div>
  );
}
