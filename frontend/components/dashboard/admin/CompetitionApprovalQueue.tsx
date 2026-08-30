"use client";

import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminPendingRaffles, useApproveRaffle } from "../../../hooks/useRaffleHooks";
import RejectCompetitionModal from "./RejectCompetitionModal";

export default function CompetitionApprovalQueue() {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<{ id: string, title: string } | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data: pendingRaffles, isLoading } = useAdminPendingRaffles();
  const approveMutation = useApproveRaffle();

  const handleReject = (id: string, title: string) => {
    setSelectedCompetition({ id, title });
    setIsRejectModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await approveMutation.mutateAsync(id);
      toast.success('Competition approved and is now live!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full select-none">

      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="font-heading font-bold text-[24px] text-text-primary">
          Competition Approval Queue
        </h1>
        <div className="px-3 py-1 rounded-badge bg-amber-50 text-amber-700 border border-amber-200 font-sans font-semibold text-[12px] shadow-sm">
          {pendingRaffles?.length || 0} Pending
        </div>
      </div>

      {/* Queue List */}
      <div className="flex flex-col gap-6">
        {isLoading && (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full bg-surface border border-border rounded-card h-[240px] animate-pulse shadow-sm" />
            ))}
          </div>
        )}

        {!isLoading && pendingRaffles?.map((item: any) => (
          <div key={item.id} className="relative w-full bg-surface border border-border rounded-card flex flex-col overflow-hidden shadow-card hover:border-border-medium transition-all duration-200">

            {/* Glowing Loading Overlay */}
            {approvingId === item.id && (
              <div className="absolute inset-0 z-10 bg-surface/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="relative flex items-center justify-center w-[120px] h-[120px] mb-4">
                  <div className="absolute inset-0 rounded-full border-[2px] border-primary/30 animate-ping" style={{ animationDuration: '2s' }}></div>
                  <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-primary border-r-primary animate-spin" style={{ animationDuration: '0.8s' }}></div>
                  <div className="absolute inset-2 rounded-full shadow-[0_0_30px_rgba(113,49,200,0.3)]"></div>
                  <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-[0_0_15px_#7131C8]"></div>
                </div>
                <h3 className="font-heading font-bold text-[20px] text-text-brand mb-2 animate-pulse">
                  Approving & Publishing...
                </h3>
                <p className="font-sans text-[13px] text-text-muted font-medium">
                  Generating public URLs and updating live status
                </p>
              </div>
            )}

            {/* Top Bar (Host Info) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-accent-bg/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0">
                  <span className="font-sans font-bold text-[11px] text-text-brand">
                    {item.host?.user?.firstName?.[0] || 'A'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans font-semibold text-[13px] text-text-primary leading-tight">
                    {item.host?.user?.firstName || 'Host'} {item.host?.user?.lastName || ''}
                  </span>
                  <span className="font-sans text-[11px] text-text-muted leading-tight mt-0.5 font-medium">
                    Submitted {item.createdAt ? formatDistanceToNow(new Date(item.createdAt)) : 'recently'} ago
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Bar (Content Details) */}
            <div className="flex flex-col sm:flex-row gap-6 p-6 pb-4">
              {/* Image Container */}
              <div className="w-full sm:w-[140px] h-[100px] shrink-0 bg-accent-bg border border-border rounded-button flex items-center justify-center overflow-hidden">
                {item.mainImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.mainImage} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                )}
              </div>

              {/* Text Info */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <h3 className="font-heading font-bold text-[18px] text-text-primary">{item.title}</h3>
                <p className="font-sans text-[13px] text-text-muted leading-relaxed max-w-[800px] font-medium">
                  {item.description || 'No description provided.'}
                </p>
                <span className="font-sans text-[12px] text-text-brand font-semibold mt-1">
                  Price: £{item.pricePerTicket} / ticket · Total: {item.totalTickets} tickets · Draw: {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'TBD'}
                </span>
              </div>
            </div>

            {/* Bottom Bar (Actions) */}
            <div className="flex flex-col sm:flex-row items-center justify-end p-6 pt-4 gap-4 mt-2 border-t border-divider">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleReject(item.id, item.title)}
                  disabled={approvingId !== null}
                  className="flex-1 sm:flex-none h-[40px] px-6 rounded-button bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 cursor-pointer font-sans font-semibold text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(item.id)}
                  disabled={approvingId !== null}
                  className="flex-1 sm:flex-none h-[40px] px-6 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[13px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Approve & Publish
                </button>
              </div>
            </div>

          </div>
        ))}
        {!isLoading && pendingRaffles?.length === 0 && (
          <div className="text-text-muted p-8 text-center bg-surface border border-border rounded-card shadow-sm font-medium">
            No pending competitions in the queue.
          </div>
        )}
      </div>

      <RejectCompetitionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        competitionData={selectedCompetition}
      />
    </div>
  );
}
