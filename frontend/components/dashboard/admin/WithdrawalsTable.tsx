"use client";

import React, { useState } from "react";
import ConfirmPayoutModal, { AdminPayoutData } from "./ConfirmPayoutModal";
import { useAdminWithdrawals } from "../../../hooks/useAdminHooks";
import EmptyState from "../../ui/EmptyState";

interface WithdrawalsTableProps {
  withdrawals?: AdminPayoutData[];
  isLoading?: boolean;
}

export default function WithdrawalsTable({ withdrawals: propWithdrawals, isLoading: propIsLoading }: WithdrawalsTableProps) {
  const { data: fetchedWithdrawals, isLoading: isQueryLoading } = useAdminWithdrawals();
  
  const withdrawals: AdminPayoutData[] = propWithdrawals || fetchedWithdrawals || [];
  const isLoading = propIsLoading !== undefined ? propIsLoading : isQueryLoading;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<AdminPayoutData | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | "VIEW">("APPROVE");

  const handleAction = (payout: AdminPayoutData, type: "APPROVE" | "REJECT" | "VIEW") => {
    setSelectedPayout(payout);
    setActionType(type);
    setIsModalOpen(true);
  };

  const getStatusStyle = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "APPROVED":
      case "COMPLETED":
      case "PAID":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "PENDING":
      case "PROCESSING":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "REJECTED":
      case "FAILED":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-border bg-accent-bg text-text-brand";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-surface border border-border rounded-card p-8 text-center text-text-muted font-sans text-sm animate-pulse shadow-sm font-medium">
        Loading withdrawal requests...
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-border rounded-card overflow-hidden shadow-card overflow-x-auto mt-2 animate-fadeIn select-none">
      <table className="w-full min-w-[1100px] text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-accent-bg/50">
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">HOST BUSINESS</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">REQUESTED GROSS</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">FEE (10%)</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">NET PAYOUT</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">PAYMENT METHOD</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">REQUEST DATE</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">STATUS</th>
            <th className="py-4 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 px-6 text-center">
                <EmptyState
                  title="No Withdrawal Requests"
                  description="There are currently no withdrawal or payout requests pending review."
                />
              </td>
            </tr>
          ) : (
            withdrawals.map((payout, i) => {
              const grossAmount = payout.amount || 0;
              const feeAmount = payout.feeAmount !== undefined ? payout.feeAmount : grossAmount * 0.10;
              const netAmount = payout.netAmount !== undefined ? payout.netAmount : grossAmount * 0.90;
              const dateStr = payout.createdAt ? new Date(payout.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

              return (
                <tr key={payout.id} className={`${i !== withdrawals.length - 1 ? 'border-b border-divider' : ''} hover:bg-accent-bg/30 transition-colors`}>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-heading font-semibold text-[14px] text-text-primary">{payout.hostBusinessName || 'Unknown Host'}</span>
                      <span className="font-sans text-[11px] text-text-muted font-medium">{payout.hostUserEmail}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-heading font-semibold text-[14px] text-text-primary">
                    £{grossAmount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-center font-heading font-medium text-[13px] text-red-600">
                    -£{feeAmount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-center font-heading font-bold text-[14px] text-text-brand">
                    £{netAmount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-center font-sans text-[13px] text-text-muted font-medium">
                    {payout.payoutMethod || 'Bank Transfer'}
                  </td>
                  <td className="py-4 px-6 text-center font-sans text-[12px] text-text-muted font-medium">
                    {dateStr}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-badge border font-sans font-semibold text-[10px] uppercase tracking-wider shadow-sm ${getStatusStyle(payout.status)}`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {payout.status.toUpperCase() === "PENDING" ? (
                        <>
                          <button 
                            onClick={() => handleAction(payout, "APPROVE")}
                            className="h-[28px] px-3 rounded-button bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white font-sans font-semibold text-[11px] transition-all cursor-pointer shadow-sm"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(payout, "REJECT")}
                            className="h-[28px] px-3 rounded-button bg-red-50 border border-red-200 text-red-700 hover:bg-red-600 hover:text-white font-sans font-semibold text-[11px] transition-all cursor-pointer shadow-sm"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleAction(payout, "VIEW")}
                          className="h-[28px] px-3 rounded-button bg-accent-bg border border-border text-text-secondary hover:text-text-primary hover:bg-border/30 font-sans font-semibold text-[11px] transition-all cursor-pointer shadow-sm"
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <ConfirmPayoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payout={selectedPayout}
        actionType={actionType}
      />
    </div>
  );
}
