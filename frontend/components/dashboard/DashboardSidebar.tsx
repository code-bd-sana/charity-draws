"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DashboardAccount } from "../../types/dashboard.types";
import { dashboardNavigation } from "../../config/dashboard-navigation.config";
import { cn } from "../../lib/utils";
import Image from "next/image";
import logo from '../../public/logo2.png';
import { useLogout } from "../../hooks/useAuthHooks";
import { useAdminOverviewStats } from "../../hooks/useAdminHooks";

interface DashboardSidebarProps {
  account: DashboardAccount;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function DashboardSidebar({ account, isCollapsed = false, onToggleCollapse }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Filter nav items by role
  const navItems = dashboardNavigation.filter(item => item.roles.includes(account.role));

  const { data: overviewStats } = useAdminOverviewStats({
    enabled: account.role === "admin",
  });

  const logout = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className={cn(
      "hidden lg:flex flex-col h-screen bg-surface border-r border-border fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out shadow-card select-none",
      isCollapsed ? "w-[72px]" : "w-[260px]"
    )}>

      {/* Brand / Logo Area */}
      <div className={cn(
        "h-[88px] flex items-center border-b border-divider shrink-0 w-full px-4 transition-all duration-300 bg-surface",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed ? (
          <Link href="/" className="relative h-[44px] w-[140px] shrink-0 select-none block">
            <Image
              alt="Charity Draws Logo"
              src={logo}
              fill
              className="object-contain"
              priority
            />
          </Link>
        ) : (
          <Link href="/" className="relative w-9 h-9 shrink-0 flex items-center justify-center bg-accent-bg border border-border-medium rounded-xl text-text-brand font-heading font-black text-xs shadow-sm hover:border-primary transition-colors" title="Home">
            CD
          </Link>
        )}

        {/* Collapse Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              "p-1.5 rounded-lg text-text-muted hover:bg-accent-bg hover:text-text-primary transition-colors cursor-pointer",
              isCollapsed && "mt-1"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide flex flex-col gap-1 w-full">
        {navItems.map((item) => {
          const isDashboardRoot = item.href === "/dashboard" || item.href === "/dashboard/admin" || item.href === "/dashboard/host" || item.href === "/dashboard/user";
          const isActive = isDashboardRoot
            ? pathname === item.href
            : pathname.startsWith(item.href);

          let displayBadge = item.badge;
          if (item.href === "/dashboard/admin/approvals" && overviewStats?.awaitingReview.count !== undefined) {
            displayBadge = overviewStats.awaitingReview.count > 0 ? overviewStats.awaitingReview.count : undefined;
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center h-[40px] rounded-[8px] transition-all duration-200 group font-sans w-full relative",
                isCollapsed ? "justify-center px-0" : "gap-[12px] pl-[19px] pr-[16px]",
                isActive
                  ? "bg-accent-bg border-l-4 border-primary shadow-sm"
                  : "bg-transparent border-l-4 border-transparent hover:bg-accent-bg/50"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-text-muted group-hover:text-text-primary")} />
              
              {!isCollapsed && (
                <span className={cn(
                  "text-[14px] leading-[normal] truncate",
                  isActive ? "text-text-brand font-bold" : "text-text-secondary group-hover:text-text-primary font-medium"
                )}>
                  {item.label}
                </span>
              )}

              {displayBadge !== undefined && (
                displayBadge === true ? (
                  <span className={cn(
                    "rounded-full bg-red-500",
                    isCollapsed ? "absolute top-2 right-2 w-2 h-2" : "ml-auto w-2 h-2"
                  )} />
                ) : (
                  <span className={cn(
                    "font-bold px-1.5 py-0.5 rounded-badge min-w-[18px] text-center",
                    isCollapsed ? "absolute -top-1 -right-1 text-[9px] bg-red-500 text-white" : "ml-auto text-[10px]",
                    !isCollapsed && (isActive ? "bg-primary text-primary-text font-bold" : "bg-accent-bg border border-border-medium text-text-brand font-semibold")
                  )}>
                    {displayBadge}
                  </span>
                )
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="w-full px-2 pt-2">
          <div className="h-px bg-divider w-full" />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Log Out" : undefined}
          className={cn(
            "flex items-center h-[40px] rounded-[8px] transition-colors duration-200 w-full hover:bg-red-50/80 group cursor-pointer",
            isCollapsed ? "justify-center px-0" : "gap-[12px] px-[16px]"
          )}
        >
          <svg className="w-5 h-5 shrink-0 text-red-500/80 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          {!isCollapsed && (
            <span className="text-[14px] font-semibold text-red-600 ml-1">Log Out</span>
          )}
        </button>
      </nav>

      {/* Profile Section (Bottom) */}
      <div className="border-t border-divider w-full shrink-0 bg-surface">
        <div 
          title={isCollapsed ? `${account.name} (${account.role})` : undefined}
          className={cn(
            "flex items-center pb-[17px] pt-[16px] w-full cursor-pointer hover:bg-accent-bg/40 transition-colors",
            isCollapsed ? "justify-center px-2" : "gap-[12px] px-[20px]"
          )}
        >
          <div className="w-[40px] h-[40px] shrink-0 rounded-full border border-border-medium bg-accent-bg flex items-center justify-center relative overflow-hidden shadow-sm">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={account.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>

          {!isCollapsed && (
            <>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-heading font-bold text-[14px] text-text-primary truncate leading-tight">
                  {account.name}
                </span>
                <div className="mt-1">
                  <span className="inline-flex items-center justify-center px-[8px] h-[18px] rounded-full border border-border-medium bg-accent-bg text-text-brand text-[10px] font-semibold font-sans uppercase tracking-wide">
                    {account.role === "host" ? "Premium Host" : `${account.role} Account`}
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
