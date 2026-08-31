import React from "react";
import HostRafflesTable from "../../../../components/dashboard/host/HostRafflesTable";

export const metadata = {
  title: "My Raffles | Host Dashboard",
};

export default function HostCompetitionsPage() {
  return (
    <div className="flex-1 w-full">
      <HostRafflesTable />
    </div>
  );
}
