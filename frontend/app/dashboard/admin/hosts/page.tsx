import React from "react";
import HostsStatsCards from "../../../../components/dashboard/admin/HostsStatsCards";
import HostsTable from "../../../../components/dashboard/admin/HostsTable";

export default function AdminHostsManagementPage() {
  return (
    <div className="flex flex-col gap-8 w-full animate-fadeIn">
      <HostsStatsCards />
      <HostsTable />
    </div>
  );
}
