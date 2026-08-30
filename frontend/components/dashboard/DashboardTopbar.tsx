"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardAccount } from "../../types/dashboard.types";
import { cn } from "../../lib/utils";
import NotificationsDropdown from "./NotificationsDropdown";
import { useLogout } from "../../hooks/useAuthHooks";

interface DashboardTopbarProps {
  account: DashboardAccount;
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function DashboardTopbar({
  account,
  onMenuClick,
  title = "Dashboard Overview",
  subtitle = "Host Portal / Dashboard Overview",
  isCollapsed = false,
  onToggleSidebar,
}: DashboardTopbarProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const logout = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-[88px] w-full bg-surface/90 backdrop-blur-md border-b border-border flex items-center justify-between px-5 lg:px-10 shrink-0 sticky top-0 z-30 shadow-sm select-none">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-primary hover:bg-accent-bg rounded-lg transition-colors cursor-pointer"
          title="Open Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Desktop Sidebar Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex items-center justify-center p-2 rounded-lg bg-bg border border-border text-text-muted hover:text-text-primary hover:bg-accent-bg/50 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}

        {/* 1-Tap Quick Switcher to Public Website */}
        <Link
          href="/live-raffles"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-badge bg-accent-bg border border-border-medium text-text-brand hover:bg-primary hover:text-primary-text text-xs font-sans font-bold transition-all shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4 text-primary group-hover:text-primary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m-17.432-6A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253" />
          </svg>
          <span className="whitespace-nowrap">Public Site</span>
        </Link>

        {/* Page Title & Subtitle */}
        <div className="flex flex-col">
          <h1 className="font-heading font-bold text-xl lg:text-2xl text-text-primary leading-tight m-0 p-0 hidden md:block">
            {title}
          </h1>
          <p className="font-sans text-xs lg:text-sm text-text-muted font-medium leading-none m-0 p-0 hidden md:block mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Input (Hidden on mobile for now to save space) */}
        <div className="hidden md:flex items-center h-10 w-64 lg:w-72 bg-bg border border-border rounded-button px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search competitions, orders..."
            className="bg-transparent border-none outline-none text-text-primary text-xs md:text-sm placeholder:text-text-muted/70 w-full ml-2 font-sans"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative w-10 h-10 bg-bg border border-border rounded-button flex items-center justify-center shrink-0 hover:bg-accent-bg/50 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            {/* Notification Dot */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <NotificationsDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-divider shrink-0" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 shrink-0 rounded-full border border-border-medium bg-accent-bg flex items-center justify-center overflow-hidden shadow-sm">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={account.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="font-heading font-bold text-xs md:text-sm text-text-primary hidden lg:block">
              {account.name}
            </span>
            <svg className="w-3.5 h-3.5 text-text-muted hidden lg:block" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-card shadow-card py-1 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-divider lg:hidden">
                <p className="text-xs font-bold text-text-primary truncate">{account.name}</p>
                <p className="text-[11px] text-text-muted truncate capitalize">{account.role} Account</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/80 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
