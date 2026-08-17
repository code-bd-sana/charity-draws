import React from "react";
import SalesMetricsCards from "../../../../components/dashboard/host/sales/SalesMetricsCards";
import SalesChart from "../../../../components/dashboard/host/sales/SalesChart";
import SalesBreakdownTable from "../../../../components/dashboard/host/sales/SalesBreakdownTable";
import { 
  mockSalesMetrics, 
  mockSalesChartData, 
  mockHostRafflesList 
} from "../../../../data/dashboard/host-dashboard.data";

export const metadata = {
  title: "Competition Sales | Host Dashboard",
};

export default function CompetitionSalesPage() {
  return (
    <div className="flex-1 w-full px-[20px] lg:px-[40px] py-[24px] lg:py-[32px] flex flex-col gap-[24px] animate-in fade-in zoom-in-95 duration-300 select-none">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-text-primary">
          Competition Sales
        </h1>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
          Monitor your revenue, ticket sales, and overall performance.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <SalesMetricsCards metrics={mockSalesMetrics} />

      {/* Sales Trend Chart */}
      <SalesChart data={mockSalesChartData} />

      {/* Competition Breakdown Table */}
      <SalesBreakdownTable raffles={mockHostRafflesList} />
    </div>
  );
}
