"use client";

import { useAllSubscriptionsAdmin } from '@/hooks/useSubscriptionHooks';
import React from "react";

export default function SubscriptionTable() {
  const { data: subscriptions, isLoading } = useAllSubscriptionsAdmin();

  if (isLoading) {
    return <div className="p-6 text-text-muted font-sans font-medium">Loading subscriptions...</div>;
  }

  const subs = subscriptions || [];

  const getStatusPill = (status: string) => {
    switch (status) {
      case "Active":
        return <span className="px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 text-emerald-700 font-sans font-semibold text-[10px] shadow-sm">Active</span>;
      case "Past Due":
        return <span className="px-3 py-1 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[10px] shadow-sm">Past Due</span>;
      case "Cancelled":
        return <span className="px-3 py-1 rounded-badge border border-red-200 bg-red-50 text-red-700 font-sans font-semibold text-[10px] shadow-sm">Cancelled</span>;
      default:
        return null;
    }
  };

  const getPlanPill = (plan: string) => {
    return <span className="px-3 py-1 rounded-badge border border-border-medium bg-accent-bg text-text-brand font-sans font-semibold text-[10px] shadow-sm">{plan || 'Free'}</span>;
  };

  return (
    <div className="w-full bg-surface border border-border rounded-card overflow-hidden shadow-card overflow-x-auto h-full flex flex-col select-none">
      <table className="w-full min-w-[1000px] text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-accent-bg/50">
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[25%]">HOST</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%]">PLAN</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]">PURCHASE DATE</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]">NEXT RENEWAL</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[17%]">PAYMENT</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">STATUS</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((sub: any, i: number) => {
            const hostName = sub.host?.businessName || (sub.host?.user?.firstName ? sub.host?.user?.firstName + ' ' + sub.host?.user?.lastName : 'Unknown Host');
            const initials = hostName.substring(0, 2).toUpperCase();
            const endDate = new Date(sub.endDate);
            const startDate = new Date(sub.startDate || sub.createdAt);
            const formattedDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(endDate);
            const formattedStartDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(startDate);
            const displayStatus = sub.status === 'ACTIVE' ? 'Active' : sub.status === 'CANCELLED' ? 'Cancelled' : 'Past Due';
            const tx = sub.transaction;

            return (
              <tr key={sub.id} className={`${i !== subs.length - 1 ? 'border-b border-divider' : ''} hover:bg-accent-bg/30 transition-colors`}>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0">
                      <span className="font-sans font-bold text-[11px] text-text-brand">{initials}</span>
                    </div>
                    <span className="font-sans font-semibold text-[13px] text-text-primary">{hostName}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {getPlanPill(sub.plan?.name || "Free")}
                </td>
                <td className="py-4 px-6">
                  <span className="font-sans font-medium text-[13px] text-text-muted">{formattedStartDate}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-sans font-medium text-[13px] text-text-muted">{formattedDate}</span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-[13px] text-text-brand">£{sub.plan?.price} - {tx?.status || 'COMPLETED'}</span>
                    {tx?.gatewayTransactionId && <span className="font-sans text-[11px] text-text-muted mt-0.5">{tx.gatewayTransactionId}</span>}
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  {getStatusPill(displayStatus)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
