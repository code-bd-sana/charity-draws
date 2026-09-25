"use client";

import React from "react";
import WithdrawalsStatsCards from "../../../../components/dashboard/admin/WithdrawalsStatsCards";
import WithdrawalsTable from "../../../../components/dashboard/admin/WithdrawalsTable";
import { useAdminWithdrawals } from "../../../../hooks/useAdminHooks";

export default function AdminWithdrawalsClient() {
  const { data: withdrawals, isLoading } = useAdminWithdrawals();

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      <div>
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">Withdraw Requests</h1>
        <p className="font-sans text-sm text-text-muted font-medium">
          Review and process payout requests from competition hosts. Every withdrawal deducts a <strong className="text-text-brand font-bold">10% platform commission fee</strong>.
        </p>
      </div>
      
      <WithdrawalsStatsCards withdrawals={withdrawals} isLoading={isLoading} />
      <WithdrawalsTable withdrawals={withdrawals} isLoading={isLoading} />
    </div>
  );
}
