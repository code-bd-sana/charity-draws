"use client";

import React, { useState } from "react";
import DrawsInfoCards from "./DrawsInfoCards";
import DrawsTable from "./DrawsTable";
import DrawDetailsPanel from "./DrawDetailsPanel";
import { useQuery } from "@tanstack/react-query";
import { raffleService, Raffle } from "../../../../services/raffle.service";
import { raffleKeys } from "../../../../hooks/queryKeys";

export default function AdminDrawsManager() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedDraw, setSelectedDraw] = useState<Raffle | null>(null);

  const filters = ["All", "Upcoming Draws", "In Progress", "Completed"];

  const getStatusQuery = (filter: string) => {
    switch (filter) {
      case "Upcoming Draws": return "Pending";
      case "In Progress": return "Live";
      case "Completed": return "Ended";
      default: return "All";
    }
  };

  const { data: drawsResponse, isLoading } = useQuery({
    queryKey: raffleKeys.adminAll({ activeFilter }),
    queryFn: () => raffleService.getAdminAllRaffles({ status: getStatusQuery(activeFilter) }),
  });

  const draws = drawsResponse?.data || [];

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      
      {/* Top Filter Pills */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setActiveFilter(filter);
              setSelectedDraw(null);
            }}
            className={`px-4 py-2 rounded-badge font-sans font-semibold text-[12px] whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === filter
                ? "bg-primary border-primary text-primary-text font-bold shadow-sm"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Info Cards */}
      <DrawsInfoCards />

      {/* Main Table */}
      {isLoading ? (
        <div className="text-text-muted py-8 text-center font-sans text-sm font-medium">Loading draws...</div>
      ) : (
        <DrawsTable draws={draws} onSelectDraw={setSelectedDraw} />
      )}

      {/* Expanded Details Panel (conditional) */}
      {selectedDraw && (
        <DrawDetailsPanel 
          draw={selectedDraw} 
          onClose={() => setSelectedDraw(null)} 
        />
      )}

    </div>
  );
}
