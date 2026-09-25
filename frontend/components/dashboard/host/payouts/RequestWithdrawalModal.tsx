"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useRequestWithdrawalMutation } from "../../../../hooks/useHostWalletHooks";
import { useMySubscription } from "../../../../hooks/useSubscriptionHooks";
import { cn, extractApiError } from "../../../../lib/utils";
import PrimaryButton from "../../../website/shared/PrimaryButton";

interface RequestWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

export default function RequestWithdrawalModal({
  isOpen,
  onClose,
  availableBalance,
}: RequestWithdrawalModalProps) {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Bank transfer details only
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [sortCode, setSortCode] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: subData } = useMySubscription();
  const isPremiumOrPro =
    !!subData?.plan &&
    (subData.plan.id === "premium" ||
      subData.plan.id === "pro" ||
      subData.plan.name?.toLowerCase().includes("premium") ||
      subData.plan.name?.toLowerCase().includes("pro") ||
      Number(subData.plan.price) > 0);

  const commissionRate = isPremiumOrPro ? 10 : 15;
  const planLabel = isPremiumOrPro ? (subData?.plan?.name || "Premium") : "Free Plan";

  const withdrawMutation = useRequestWithdrawalMutation();

  if (!isOpen || !mounted) return null;

  const numAmount = parseFloat(amount) || 0;
  const feeAmount = numAmount * (commissionRate / 100);
  const netAmount = numAmount - feeAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (numAmount < 10) {
      const err = "Minimum withdrawal amount is £10.00";
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (numAmount > availableBalance) {
      const err = `Cannot withdraw more than your available balance (£${availableBalance.toFixed(2)})`;
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!accountHolderName.trim() || !bankName.trim() || !accountNumber.trim()) {
      const err = "Please complete all required bank account fields.";
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    const payoutDetails = {
      accountHolderName: accountHolderName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      sortCode: sortCode.trim(),
    };

    withdrawMutation.mutate(
      {
        amount: numAmount,
        payoutMethod: "BANK_TRANSFER",
        payoutDetails,
      },
      {
        onSuccess: () => {
          toast.success("Withdrawal request submitted successfully! Your payout is now processing.");
          onClose();
        },
        onError: (err: any) => {
          const msg = extractApiError(err, "Failed to submit withdrawal request.");
          setErrorMessage(msg);
          toast.error(msg);
        },
      }
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-surface border border-border rounded-card w-[95vw] sm:max-w-[540px] max-h-[85vh] overflow-hidden shadow-2xl flex flex-col z-[10000]">
        
        {/* Pinned Header */}
        <div className="p-5 sm:p-6 border-b border-divider flex items-center justify-between bg-surface shrink-0">
          <div>
            <h3 className="font-heading font-bold text-base sm:text-lg md:text-xl text-text-primary">
              Request Payout Withdrawal
            </h3>
            <p className="font-sans text-xs sm:text-sm text-text-muted font-medium mt-0.5">
              Available Balance: <strong className="text-text-brand font-bold">£{availableBalance.toFixed(2)}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-full hover:bg-accent-bg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Scrollable Body */}
          <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            {errorMessage && (
              <div className="p-3.5 rounded-card bg-red-50 border border-red-200 text-red-700 text-xs font-sans font-medium">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-semibold text-text-muted uppercase tracking-wider">
                Withdrawal Amount (£)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">£</span>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-11 pl-9 pr-20 bg-bg border border-border rounded-button text-text-primary font-heading text-lg font-bold focus:outline-none focus:border-primary transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance.toString())}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-sans font-bold bg-accent-bg text-text-brand border border-border-medium rounded-button hover:bg-primary hover:text-primary-text transition-all cursor-pointer min-h-[32px]"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Fee Breakdown Card */}
            <div className="bg-accent-bg/50 border border-border-medium rounded-card p-4 space-y-2 text-xs font-sans shadow-sm">
              <div className="flex justify-between text-text-muted font-medium">
                <span>Requested Gross Amount:</span>
                <span className="font-bold text-text-primary">£{numAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600 font-medium">
                <span>Platform Fee ({commissionRate}% - {planLabel}):</span>
                <span className="font-bold">-£{feeAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-divider flex justify-between text-sm font-bold">
                <span className="text-text-secondary">Net Amount You Receive:</span>
                <span className="text-text-brand font-bold text-base">£{netAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payout Method Notice (Bank Transfer Only) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-semibold text-text-muted uppercase tracking-wider">
                Payout Method
              </label>
              <div className="p-3 rounded-button border border-border-medium bg-accent-bg flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2 text-text-primary font-bold">
                  <span>🏦</span>
                  <span>Direct Bank Transfer</span>
                </div>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  Secure Direct Deposit
                </span>
              </div>
            </div>

            {/* Bank Transfer Details Fields */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1 font-sans">Account Holder Name *</label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="e.g. John Doe / Charity Org Ltd"
                  className="w-full h-11 px-3.5 bg-bg border border-border rounded-button text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1 font-sans">Bank Name *</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Barclays / HSBC / Lloyds"
                    className="w-full h-11 px-3.5 bg-bg border border-border rounded-button text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1 font-sans">Sort Code *</label>
                  <input
                    type="text"
                    value={sortCode}
                    onChange={(e) => setSortCode(e.target.value)}
                    placeholder="e.g. 12-34-56"
                    className="w-full h-11 px-3.5 bg-bg border border-border rounded-button text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1 font-sans">Account Number / IBAN *</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 12345678 or GB82 WEST 1234 5678"
                  className="w-full h-11 px-3.5 bg-bg border border-border rounded-button text-xs text-text-primary focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pinned Footer Actions */}
          <div className="p-4 sm:p-5 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-divider bg-surface shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-button border border-border text-xs font-sans font-semibold text-text-secondary hover:bg-accent-bg/50 transition-all cursor-pointer flex items-center justify-center"
            >
              Cancel
            </button>
            <PrimaryButton
              type="submit"
              isLoading={withdrawMutation.isPending}
              loadingText="Submitting..."
              disabled={numAmount <= 0}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 text-xs md:text-sm uppercase tracking-wider flex items-center justify-center"
            >
              Confirm & Withdraw £{netAmount.toFixed(2)}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
