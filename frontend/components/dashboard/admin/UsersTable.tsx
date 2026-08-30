"use client";

import React, { useState } from "react";
import { useAdminUsers, useToggleUserBlockMutation } from "../../../hooks/useAdminHooks";
import { format } from "date-fns";
import ConfirmBlockModal from "./ConfirmBlockModal";
import UserDetailsModal from "./UserDetailsModal";
import { User } from "../../../services/admin.service";

export default function UsersTable() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [blockModalUser, setBlockModalUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data, isLoading, isError } = useAdminUsers({ page, limit, search });
  const toggleBlock = useToggleUserBlockMutation();

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      return;
    }
    const headers = ["ID", "First Name", "Last Name", "Email", "Role", "Joined Date", "Tickets Count", "Total Spent (£)", "Status"];
    const rows = filteredUsers.map(user => [
      user.id,
      user.firstName || "",
      user.lastName || "",
      user.email,
      user.role,
      user.createdAt,
      user.ticketsCount || 0,
      user.totalSpent.toFixed(2),
      user.isBlocked ? "Blocked" : "Active"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const getStatusPill = (isBlocked: boolean) => {
    if (isBlocked) {
      return <span className="px-3 py-1 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[10px] shadow-sm">Blocked</span>;
    }
    return <span className="px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-[10px] shadow-sm">Active</span>;
  };

  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    return email[0].toUpperCase();
  };

  const users = data?.users || [];
  
  const filteredUsers = users.filter((user) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Active") return !user.isBlocked;
    if (activeFilter === "Blocked") return user.isBlocked;
    return true;
  });

  return (
    <>
      <div className="flex flex-col gap-6 select-none">
      
      {/* Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border shadow-card">
        
        {/* Left: Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          {/* Search Input */}
          <div className="flex items-center h-[40px] w-full sm:w-[320px] bg-bg border border-border rounded-button px-3 focus-within:border-primary transition-colors">
            <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={search}
              onChange={handleSearchChange}
              className="bg-transparent border-none outline-none text-text-primary text-[13px] placeholder:text-text-muted w-full ml-2 font-sans"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {["All", "Active", "Blocked"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-badge text-[12px] font-sans font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === filter 
                    ? 'bg-primary border-primary text-primary-text font-bold shadow-sm' 
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Export CSV */}
        <button 
          onClick={handleExportCSV}
          disabled={filteredUsers.length === 0}
          className="group h-[40px] px-4 bg-accent-bg border border-border-medium hover:bg-primary rounded-button flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-sm"
        >
          <svg className="w-4 h-4 text-text-brand group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span className="font-sans font-semibold text-[13px] text-text-brand group-hover:text-white transition-colors">Export CSV</span>
        </button>

      </div>

      {/* Table Container */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden shadow-card overflow-x-auto">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-accent-bg/50">
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[30%]">NAME / EMAIL</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%]">JOINED</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%] text-center">TICKETS</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%] text-center">SPENT</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%]">STATUS</th>
              <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-divider last:border-b-0">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-accent-bg shrink-0" />
                      <div className="flex flex-col gap-1.5">
                        <div className="h-4.5 w-28 bg-accent-bg rounded" />
                        <div className="h-3.5 w-36 bg-accent-bg rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 w-24 bg-accent-bg rounded animate-pulse" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-4 w-8 bg-accent-bg rounded animate-pulse mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="h-4 w-12 bg-accent-bg rounded animate-pulse mx-auto" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-6 w-16 bg-accent-bg rounded-full animate-pulse" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-4.5 h-4.5 bg-accent-bg rounded animate-pulse" />
                      <div className="w-4.5 h-4.5 bg-accent-bg rounded animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-text-muted font-sans text-sm font-medium">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, i) => (
                <tr key={user.id} className={`${i !== filteredUsers.length - 1 ? 'border-b border-divider' : ''} hover:bg-accent-bg/30 transition-colors`}>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0">
                      <span className="font-sans font-bold text-[11px] text-text-brand">
                        {getInitials(user.firstName, user.lastName, user.email)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans font-semibold text-[13px] text-text-primary">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'No Name'}
                      </span>
                      <span className="font-sans text-[11px] text-text-muted font-medium">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-sans text-[13px] text-text-muted font-medium">
                    {format(new Date(user.createdAt), 'dd MMM yyyy')}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="font-sans font-semibold text-[13px] text-text-primary">{user.ticketsCount}</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="font-sans font-bold text-[13px] text-text-brand">£{user.totalSpent.toFixed(2)}</span>
                </td>
                <td className="py-4 px-6">
                  {getStatusPill(user.isBlocked)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}
                      className="text-text-muted hover:text-text-brand transition-colors flex items-center justify-center shrink-0 cursor-pointer" 
                      title="View details"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                    {user.isBlocked ? (
                      <button 
                        onClick={() => setBlockModalUser(user)}
                        disabled={toggleBlock.isPending}
                        className="text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50 cursor-pointer" 
                        title="Unblock user"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                      </button>
                    ) : (
                      <button 
                        onClick={() => setBlockModalUser(user)}
                        disabled={toggleBlock.isPending}
                        className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 cursor-pointer" 
                        title="Block user"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface border border-border rounded-card px-6 py-4 shadow-sm">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-[13px] font-sans font-semibold text-text-primary disabled:text-text-muted hover:text-text-brand transition-colors cursor-pointer"
          >
            Previous
          </button>
          <span className="text-[13px] font-sans text-text-muted font-medium">Page {page} of {data.totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="text-[13px] font-sans font-semibold text-text-primary disabled:text-text-muted hover:text-text-brand transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

    </div>

      <ConfirmBlockModal 
        isOpen={!!blockModalUser}
        onClose={() => setBlockModalUser(null)}
        onConfirm={() => {
          if (blockModalUser) {
            toggleBlock.mutate(blockModalUser.id, {
              onSuccess: () => setBlockModalUser(null)
            });
          }
        }}
        isLoading={toggleBlock.isPending}
        isBlocked={blockModalUser?.isBlocked ?? false}
        userIdentifier={blockModalUser?.email || blockModalUser?.firstName || "this user"}
      />

      <UserDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedUser(null); }}
        user={selectedUser}
      />
    </>
  );
}
