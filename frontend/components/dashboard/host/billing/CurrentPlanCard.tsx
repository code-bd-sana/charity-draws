"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useMySubscription, useCancelSubscriptionMutation } from "../../../../hooks/useSubscriptionHooks";

export default function CurrentPlanCard() {
  const { data: subscription, isLoading, refetch } = useMySubscription();
  const cancelMutation = useCancelSubscriptionMutation();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel your subscription?")) {
      setIsCancelling(true);
      try {
        await cancelMutation.mutateAsync();
        toast.success('Subscription cancelled successfully.');
        refetch();
      } catch (err) {
        toast.error('Failed to cancel subscription.');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  if (isLoading) {
    return <div className="p-6 text-text-muted font-sans font-medium text-sm animate-pulse">Loading subscription...</div>;
  }

  if (!subscription || subscription.status !== 'ACTIVE') {
    return (
      <div className="w-full bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-card">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading font-bold text-lg md:text-xl text-text-primary">
            No Active Subscription
          </h2>
          <p className="font-sans font-semibold text-xs md:text-sm text-red-600">
            {subscription?.status === 'CANCELLED' ? 'Your subscription was cancelled.' : 'You do not have an active plan.'}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a href="/pricing" className="h-10 flex items-center justify-center px-6 bg-primary hover:bg-primary-hover rounded-button font-heading font-bold text-xs md:text-sm text-primary-text transition-all shadow-glow cursor-pointer">
            Subscribe Now
          </a>
        </div>
      </div>
    );
  }

  const endDate = new Date(subscription.endDate);
  const startDate = new Date(subscription.startDate);
  const formattedEndDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(endDate);
  const formattedStartDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(startDate);
  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
  const tx = subscription.transaction;

  return (
    <div className="w-full bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-card">
      
      {/* Plan Details */}
      <div className="flex flex-col gap-2">
        <h2 className="font-heading font-bold text-lg md:text-xl text-text-primary">
          Current Plan: {subscription.plan.name}
        </h2>
        <p className="font-sans font-bold text-sm md:text-base text-text-brand">
          £{subscription.plan.price}/month · Renews {formattedEndDate} ({remainingDays} days left)
        </p>
        <div className="font-sans text-xs text-text-muted mt-2 space-y-1 font-medium">
          <p><strong className="text-text-secondary">Start Date:</strong> {formattedStartDate}</p>
          <p><strong className="text-text-secondary">Payment Status:</strong> <span className="text-emerald-700 font-bold">{tx?.status || 'COMPLETED'}</span></p>
          {tx?.gatewayTransactionId && <p><strong className="text-text-secondary">Transaction ID:</strong> <span className="font-mono">{tx.gatewayTransactionId}</span></p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <button 
          onClick={handleCancel} 
          disabled={isCancelling}
          className="font-sans font-semibold text-xs md:text-sm text-red-600 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
        </button>
      </div>
      
    </div>
  );
}
