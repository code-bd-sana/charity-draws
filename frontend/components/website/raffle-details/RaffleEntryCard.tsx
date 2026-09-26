"use client";

import React, { useState, useEffect } from "react";
import { RaffleDetail } from "../../../types/raffle-details.types";
import { usePurchaseTicketsMutation } from "../../../hooks/useTicketHooks";
import { usePublicRaffleDetail } from "../../../hooks/useRaffleHooks";
import { useAuth } from "../../../features/auth/AuthContext";
import { useBasket } from "../../../features/basket/BasketContext";
import { useRouter } from "next/navigation";
import TicketPurchaseSuccessModal, { TicketPurchaseSuccessData } from "./TicketPurchaseSuccessModal";
import FreePostalEntryButton from "../legal/FreePostalEntryButton";
import {
  formatUKDateTime,
  formatUKDate,
  getRaffleTimingStatus,
  RaffleTimingStatus,
} from "../../../lib/uk-date";

interface RaffleEntryCardProps {
  raffle: RaffleDetail;
}

export default function RaffleEntryCard({ raffle }: RaffleEntryCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [statusMessage, setStatusMessage] = useState<{type: 'success'|'error'|'info', text: string} | null>(null);
  const [purchaseSuccessData, setPurchaseSuccessData] = useState<TicketPurchaseSuccessData | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [timingStatus, setTimingStatus] = useState<RaffleTimingStatus>('LIVE');

  const { isAuthenticated } = useAuth();
  const { addItem } = useBasket();
  const router = useRouter();
  
  const purchaseMutation = usePurchaseTicketsMutation(raffle.id);

  // Configure 15-second background polling interval for active draws
  const { data: liveData } = usePublicRaffleDetail(raffle.slug || raffle.id, {
    refetchInterval: (query: any) => {
      const data = query?.state?.data;
      const status = data?.status || raffle.status;
      const isLive = status === "ACTIVE" || status === "live" || status === "ending_soon";
      return isLive ? 15_000 : false;
    },
  });

  const {
    ticketPrice,
    totalPoolValue,
    worthPrice,
  } = raffle;

  const totalTickets = liveData?.totalTickets ?? raffle.totalTickets;
  const soldTickets = liveData?.ticketsSold ?? raffle.soldTickets;
  const startDate = (liveData as any)?.startDate ?? raffle.startDate;
  const endDate = liveData?.endDate ?? raffle.endDate;

  const minTickets = Math.max(1, (liveData as any)?.minTicketsPerUser ?? (raffle as any)?.minTicketsPerUser ?? 1);
  const maxTickets = (liveData as any)?.maxTicketsPerUser ?? (raffle as any)?.maxTicketsPerUser ?? null;

  // Initialize or adjust quantity when minTickets is set
  useEffect(() => {
    if (minTickets > 1 && quantity < minTickets) {
      setQuantity(minTickets);
    }
  }, [minTickets]);

  useEffect(() => {
    if (!endDate) {
      setTimeLeft("Ended");
      setTimingStatus("ENDED");
      return;
    }
    const calc = () => {
      const timing = getRaffleTimingStatus(startDate, endDate);
      setTimingStatus(timing.status);

      const pad = (n: number) => n.toString().padStart(2, '0');

      if (timing.status === 'UPCOMING') {
        const diff = timing.startsInMs;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        if (d > 0) return `Starts in ${d}d ${pad(h)}h ${pad(m)}m`;
        return `Starts in ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
      }

      if (timing.status === 'ENDED') {
        return "Ended";
      }

      const diff = timing.endsInMs;
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
      return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const soldPercent = Math.min(Math.round((soldTickets / totalTickets) * 100), 100);
  const remainingTickets = Math.max(totalTickets - soldTickets, 0);
  const totalPrice = quantity * ticketPrice;

  // Adjust quick picks based on minTickets and maxTickets
  const rawQuickPicks = [1, 5, 10, 20];
  const quickPicks = rawQuickPicks.map(val => Math.max(val, minTickets)).filter((val, idx, arr) => arr.indexOf(val) === idx && (!maxTickets || val <= maxTickets));

  const handleQuickPick = (val: number) => {
    let target = Math.max(val, minTickets);
    if (maxTickets && target > maxTickets) target = maxTickets;
    setQuantity(target);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > minTickets ? prev - 1 : minTickets));
  };

  const handleIncrement = () => {
    setQuantity(prev => {
      if (maxTickets && prev >= maxTickets) return prev;
      if (prev >= remainingTickets) return prev;
      return prev + 1;
    });
  };

  const validateConstraints = (): boolean => {
    if (timingStatus === 'UPCOMING') {
      setStatusMessage({ type: 'error', text: 'This competition has not started yet.' });
      return false;
    }

    if (timingStatus === 'ENDED') {
      setStatusMessage({ type: 'error', text: 'This competition has already ended.' });
      return false;
    }

    if (quantity < minTickets) {
      setStatusMessage({ type: 'error', text: `Minimum ${minTickets} ticket(s) required to enter.` });
      return false;
    }

    if (maxTickets && quantity > maxTickets) {
      setStatusMessage({ type: 'error', text: `Maximum limit is ${maxTickets} ticket(s) per participant.` });
      return false;
    }
    
    if (quantity > remainingTickets) {
      setStatusMessage({ type: 'error', text: `Only ${remainingTickets} tickets left.` });
      return false;
    }

    setStatusMessage(null);
    return true;
  };

  const handleAddToBasket = () => {
    if (!validateConstraints()) return;

    addItem({
      raffleId: raffle.id,
      title: raffle.title,
      slug: raffle.slug || raffle.id,
      image: (raffle as any).mainImage || (raffle as any).image || '',
      ticketPrice: ticketPrice,
      quantity,
      totalTickets,
      ticketsSold: soldTickets,
      minTickets,
      maxTickets,
      endDate: raffle.endDate,
      category: (raffle as any).category,
    });
  };

  const handleBuyNow = () => {
    if (!validateConstraints()) return;

    addItem({
      raffleId: raffle.id,
      title: raffle.title,
      slug: raffle.slug || raffle.id,
      image: (raffle as any).mainImage || (raffle as any).image || '',
      ticketPrice: ticketPrice,
      quantity,
      totalTickets,
      ticketsSold: soldTickets,
      minTickets,
      maxTickets,
      endDate: raffle.endDate,
      category: (raffle as any).category,
    });

    router.push('/checkout');
  };

  const handlePurchase = () => {
    if (timingStatus === 'UPCOMING') {
      setStatusMessage({ type: 'error', text: 'This competition has not started yet.' });
      return;
    }

    if (timingStatus === 'ENDED') {
      setStatusMessage({ type: 'error', text: 'This competition has already ended.' });
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (quantity < minTickets) {
      setStatusMessage({ type: 'error', text: `Minimum ${minTickets} ticket(s) required to enter.` });
      return;
    }

    if (maxTickets && quantity > maxTickets) {
      setStatusMessage({ type: 'error', text: `Maximum limit is ${maxTickets} ticket(s) per participant.` });
      return;
    }
    
    if (quantity > remainingTickets) {
      setStatusMessage({ type: 'error', text: `Only ${remainingTickets} tickets left.` });
      return;
    }
    
    setStatusMessage(null);
    purchaseMutation.mutate(quantity, {
      onSuccess: (data) => {
        if (data?.url) {
          window.location.href = data.url;
          return;
        }

        const formattedWins = (data.instantWins || []).map((iw: any) => {
          const tk = (data.tickets || []).find((t: any) => t.id === iw.ticketId);
          return {
            id: iw.id,
            ticketId: iw.ticketId,
            prizeName: iw.prizeName,
            ticketNumber: tk ? tk.ticketNumber : undefined,
          };
        });

        setPurchaseSuccessData({
          raffleTitle: raffle.title,
          tickets: data.tickets || [],
          instantWins: formattedWins,
          totalAmount: totalPrice,
        });

        setQuantity(1);
      },
      onError: (error: any) => {
        setStatusMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Failed to purchase tickets' 
        });
      }
    });
  };

  return (
    <div className="bg-white border border-[#E9D5FF] rounded-[24px] p-6 sm:p-7 flex flex-col w-full max-w-[420px] shadow-[0_10px_35px_rgba(113,49,200,0.06)]">
      
      {/* Top Value Section */}
      <div className="flex flex-col gap-1 mb-6">
        <span className="font-sans text-[11px] text-[#6B7280] font-bold uppercase tracking-wider">Combined Prize Pool</span>
        <span className="font-heading font-extrabold text-3xl sm:text-4xl text-[#7131C8] leading-tight">£{totalPoolValue.toLocaleString()}</span>
        <span className="font-sans text-xs text-[#6B7280] font-medium">
          Worth: £{(worthPrice || totalPoolValue).toLocaleString()}. Est. Valuation: £{((worthPrice || totalPoolValue) * 0.9).toLocaleString()}
        </span>
      </div>

      {/* Stats Rows */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#F5EDFF]">
          <span className="font-sans text-xs text-[#6B7280] font-medium">
            {timingStatus === 'UPCOMING' ? 'Starts (UK Time)' : 'Draw Closes (UK Time)'}
          </span>
          <span className="font-heading font-bold text-xs sm:text-sm text-[#7131C8] tabular-nums tracking-wider animate-pulse">
            {timeLeft || (timingStatus === 'UPCOMING' ? formatUKDateTime(startDate) : "Ended")}
          </span>
        </div>
        <div className="flex items-center justify-between pb-3 border-b border-[#F5EDFF]">
          <span className="font-sans text-xs text-[#6B7280] font-medium">Ticket Price</span>
          <span className="font-heading font-bold text-xs sm:text-sm text-[#2E0B57]">£{ticketPrice.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between pb-3 border-b border-[#F5EDFF]">
          <span className="font-sans text-xs text-[#6B7280] font-medium">Tickets</span>
          <span className="font-heading font-bold text-xs sm:text-sm text-[#2E0B57]">{soldTickets.toLocaleString()} / {totalTickets.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="w-full h-2.5 bg-[#F3E8FF] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#7131C8] to-[#9333EA] rounded-full transition-all duration-500" 
            style={{ width: `${soldPercent}%` }}
          />
        </div>
        <div className="flex justify-end">
          <span className="font-sans text-xs font-semibold text-[#7131C8]">{remainingTickets.toLocaleString()} tickets left</span>
        </div>
      </div>

      {/* Ticket Selection */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs font-bold text-[#2E0B57]">Number of tickets</span>
          {(minTickets > 1 || maxTickets) && (
            <span className="font-sans text-[11px] text-[#6B7280]">
              {minTickets > 1 && `Min: ${minTickets}`}
              {minTickets > 1 && maxTickets && " • "}
              {maxTickets && `Max: ${maxTickets}`}
            </span>
          )}
        </div>
        
        {quickPicks.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {quickPicks.map((num) => (
              <button
                key={num}
                onClick={() => handleQuickPick(num)}
                className={`h-10 rounded-xl font-sans font-bold text-xs transition-all cursor-pointer ${
                  quantity === num 
                    ? "bg-[#7131C8] border border-[#7131C8] text-white shadow-sm" 
                    : "bg-[#FBF8FF] border border-[#E9D5FF] text-[#524B63] hover:border-[#7131C8] hover:text-[#7131C8]"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center h-11 bg-[#FBF8FF] border border-[#E9D5FF] rounded-xl overflow-hidden mt-1">
          <button 
            onClick={handleDecrement}
            disabled={quantity <= minTickets}
            className={`w-11 h-full flex items-center justify-center bg-[#F3E8FF] text-[#7131C8] font-bold transition-colors cursor-pointer ${
              quantity <= minTickets ? "opacity-35 cursor-not-allowed" : "hover:bg-[#E9D5FF]"
            }`}
          >
            -
          </button>
          <div className="flex-1 h-full flex items-center justify-center font-sans font-bold text-sm text-[#2E0B57] border-x border-[#E9D5FF]">
            {quantity}
          </div>
          <button 
            onClick={handleIncrement}
            disabled={(maxTickets !== null && quantity >= maxTickets) || quantity >= remainingTickets}
            className={`w-11 h-full flex items-center justify-center bg-[#F3E8FF] text-[#7131C8] font-bold transition-colors cursor-pointer ${
              (maxTickets !== null && quantity >= maxTickets) || quantity >= remainingTickets
                ? "opacity-35 cursor-not-allowed"
                : "hover:bg-[#E9D5FF]"
            }`}
          >
            +
          </button>
        </div>
      </div>

      {/* Total & Enter CTA */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-[#6B7280] font-medium">Total ({quantity} tickets)</span>
          <span className="font-heading font-extrabold text-xl text-[#7131C8]">£{totalPrice.toFixed(2)}</span>
        </div>

        {timingStatus === 'UPCOMING' ? (
          <button 
            disabled={true}
            className="w-full h-12 rounded-xl font-heading font-semibold text-sm bg-[#F3E8FF] text-[#7131C8] border border-[#D8B4FE] cursor-not-allowed flex items-center justify-center shadow-sm"
          >
            Draw Starts {startDate ? formatUKDate(startDate) : "Soon"}
          </button>
        ) : timingStatus === 'ENDED' ? (
          <button 
            disabled={true}
            className="w-full h-12 rounded-xl font-heading font-semibold text-sm bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB] cursor-not-allowed flex items-center justify-center shadow-sm"
          >
            Competition Ended
          </button>
        ) : (
          <div className="flex flex-col gap-2.5">
            {/* Primary: Add to Basket */}
            <button 
              onClick={handleAddToBasket}
              disabled={remainingTickets === 0}
              className={`w-full h-12 rounded-xl font-heading font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                remainingTickets === 0
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover text-white shadow-[0_6px_20px_rgba(113,49,200,0.3)] hover:shadow-[0_8px_25px_rgba(113,49,200,0.45)]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span>Add to Basket — £{totalPrice.toFixed(2)}</span>
            </button>

            {/* Secondary: Instant Checkout */}
            <button 
              onClick={handleBuyNow}
              disabled={remainingTickets === 0}
              className="w-full h-11 px-3 rounded-xl font-heading font-bold text-xs sm:text-sm bg-accent-bg hover:bg-elevated text-text-brand border border-border-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="truncate">Instant Checkout (Direct Entry)</span>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}

        {/* UK-Compliant Free Postal Entry Route Button */}
        <FreePostalEntryButton raffleTitle={raffle.title} variant="button" />

        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs font-sans text-center ${
            statusMessage.type === 'success' ? 'bg-[#F3E8FF] text-[#7131C8] border border-[#D8B4FE]' : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <p className="font-sans text-[11px] text-[#6B7280] text-center">
          Secure checkout. Competitions fully audited.
        </p>
      </div>

      {/* Share Button */}
      <button className="w-full h-10 mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#FBF8FF] border border-[#E9D5FF] hover:border-[#7131C8] text-[#524B63] hover:text-[#7131C8] font-sans font-semibold text-xs transition-colors cursor-pointer">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
        </svg>
        Share this competition
      </button>

      {/* Instant Ticket Numbers & Instant Win Purchase Confirmation Modal */}
      <TicketPurchaseSuccessModal
        isOpen={!!purchaseSuccessData}
        onClose={() => setPurchaseSuccessData(null)}
        data={purchaseSuccessData}
      />
    </div>
  );
}
