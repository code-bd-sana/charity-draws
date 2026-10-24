import React from "react";
import SubscriptionStatsCards from "../../../../components/dashboard/admin/SubscriptionStatsCards";
import PlanDistributionChart from "../../../../components/dashboard/admin/PlanDistributionChart";
import SubscriptionTable from "../../../../components/dashboard/admin/SubscriptionTable";

export default function AdminSubscriptionsManagementPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Top Section: 4 Stats Cards + Plan Distribution Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-stretch">
        <SubscriptionStatsCards />
        <PlanDistributionChart />
      </div>

      {/* Main Table: Full-Width with Status Tabs, Search, Plan Filter & Real Data */}
      <SubscriptionTable />
    </div>
  );
}
