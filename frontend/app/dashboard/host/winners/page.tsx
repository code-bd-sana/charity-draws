import React from "react";
import WinnersTable from "../../../../components/dashboard/host/winners/WinnersTable";

export const metadata = {
  title: "Winners & Draws | Host Dashboard",
};

export default function WinnersAndDrawsPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 select-none">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-text-primary">
          Winners & Draws
        </h1>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
          Manage your upcoming competition draws and view past winners.
        </p>
      </div>

      {/* Main Table Component (includes modal state internally) */}
      <WinnersTable />

    </div>
  );
}
