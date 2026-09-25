"use client";

import React, { useState } from "react";
import { useAdminLogs } from "../../../hooks/useAdminHooks";
import { format } from "date-fns";

export default function LogsActivityTable() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useAdminLogs({
    page,
    limit,
    search,
    filter: activeFilter,
  });

  const logs = data?.logs || [];
  const totalPages = data?.meta?.totalPages || 1;

  const filters = ["All", "User Actions", "Admin Actions", "System Events", "Errors"];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Success":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Failed":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-border bg-accent-bg text-text-brand";
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Timestamp", "Actor Name", "Actor Type", "Description", "IP Address", "Status"];
    const rows = logs.map(log => [
      log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : "",
      log.actor.name,
      log.actor.type,
      log.description,
      log.ip,
      log.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `system_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full mt-2 animate-fadeIn select-none">
      
      {/* Top Controls Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border shadow-card">
        {/* Pills */}
        <div className="flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setPage(1);
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

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center w-full max-w-[320px]">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search logs by keyword..." 
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full h-[38px] bg-bg border border-border rounded-button pl-4 pr-10 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors font-sans"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-brand cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Table Container */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden shadow-card overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1050px] text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-accent-bg/50">
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]">TIMESTAMP</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[20%]">ACTOR</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[35%]">ACTION DESCRIPTION</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%]">IP ADDRESS</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-right">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-divider last:border-b-0 animate-pulse">
                  <td className="py-5 px-6">
                    <div className="h-4 w-28 bg-accent-bg rounded" />
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-accent-bg shrink-0" />
                      <div className="h-4 w-24 bg-accent-bg rounded" />
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 w-80 bg-accent-bg rounded" />
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 w-24 bg-accent-bg rounded" />
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="h-6 w-14 bg-accent-bg rounded-full ml-auto" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-red-600 font-sans text-sm font-semibold">
                  Failed to load logs. Please try again.
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted font-sans text-sm font-medium">
                  No log entries found.
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={log.id} className={`${i !== logs.length - 1 ? 'border-b border-divider' : ''} hover:bg-accent-bg/30 transition-colors`}>
                  <td className="py-5 px-6">
                    <span className="font-sans text-[13px] text-text-muted font-medium">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0">
                        <span className="font-sans font-bold text-[10px] text-text-brand">{log.actor.initials}</span>
                      </div>
                      <span className="font-sans font-semibold text-[13px] text-text-primary truncate max-w-[150px]" title={log.actor.name}>
                        {log.actor.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-sans text-[13px] text-text-primary leading-relaxed font-medium">{log.description}</span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-sans text-[13px] text-text-muted font-medium">{log.ip}</span>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <span className={`px-3 py-1 rounded-badge border font-sans font-semibold text-[10px] whitespace-nowrap shadow-sm ${getStatusStyle(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Footer actions */}
        <div className="flex items-center justify-between p-6 bg-surface border-t border-divider">
          <button 
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="group flex items-center justify-center gap-2 h-[36px] px-4 rounded-button bg-accent-bg border border-border-medium hover:bg-primary text-text-brand font-sans font-semibold text-[12px] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 text-text-brand group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="group-hover:text-white transition-colors">Export Logs</span>
          </button>
          
          {/* Pagination */}
          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 h-8 rounded-button border border-border hover:bg-accent-bg disabled:opacity-30 disabled:cursor-not-allowed bg-surface text-text-primary font-sans font-semibold text-[12px] flex items-center justify-center transition-colors cursor-pointer"
              >
                Prev
              </button>
              <span className="text-text-muted px-2 font-sans text-xs font-medium">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 h-8 rounded-button border border-border hover:bg-accent-bg disabled:opacity-30 disabled:cursor-not-allowed bg-surface text-text-primary font-sans font-semibold text-[12px] flex items-center justify-center transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
