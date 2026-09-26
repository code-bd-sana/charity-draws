"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBasket } from "../../../features/basket/BasketContext";
import { formatCurrency, cn } from "../../../lib/utils";

export default function BasketDrawer() {
  const {
    items,
    isBasketOpen,
    closeBasket,
    updateQuantity,
    removeItem,
    totalTicketsCount,
    totalAmount,
  } = useBasket();
  const router = useRouter();

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isBasketOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isBasketOpen]);

  if (!isBasketOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={closeBasket}
      />

      {/* Slide-over Drawer Panel */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[460px] sm:max-w-[480px] bg-surface border-l border-border shadow-2xl z-50 flex flex-col font-sans select-none animate-in slide-in-from-right duration-300 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Basket"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-accent-bg/30 shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center text-text-brand shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-[16px] sm:text-[17px] text-text-primary leading-tight truncate">
                Your Basket
              </h2>
              <span className="text-[11px] text-text-muted font-medium truncate block">
                {totalTicketsCount} {totalTicketsCount === 1 ? "ticket" : "tickets"} across {items.length} {items.length === 1 ? "draw" : "draws"}
              </span>
            </div>
          </div>

          <button
            onClick={closeBasket}
            className="w-8 h-8 rounded-full hover:bg-surface text-text-muted hover:text-text-primary border border-transparent hover:border-border transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close basket"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Body (Items List) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 custom-scrollbar bg-bg/40">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-4">
              <div className="w-16 h-16 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center text-text-brand shadow-sm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1 max-w-[280px]">
                <h3 className="font-heading font-bold text-[18px] text-text-primary">
                  Your Basket is Empty
                </h3>
                <p className="font-sans text-[13px] text-text-muted leading-relaxed">
                  Browse our live competitions and pick your lucky numbers to win premium prizes!
                </p>
              </div>
              <button
                onClick={() => {
                  closeBasket();
                  router.push("/live-raffles");
                }}
                className="mt-2 px-6 py-2.5 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[13px] transition-all cursor-pointer shadow-sm"
              >
                Browse Live Competitions
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const itemTotal = item.quantity * Number(item.ticketPrice || 0);
                const min = item.minTickets || 1;
                const max = item.maxTickets ?? null;
                const remaining = Math.max(0, item.totalTickets - item.ticketsSold);

                return (
                  <div
                    key={item.raffleId}
                    className="bg-surface border border-border rounded-card p-3 sm:p-4 flex gap-3 sm:gap-3.5 shadow-sm hover:border-border-medium transition-all overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <div className="w-[62px] h-[62px] sm:w-[74px] sm:h-[74px] bg-accent-bg border border-border rounded-button overflow-hidden shrink-0 relative">
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3 7.5A2.25 2.25 0 0 1 5.25 5h13.5A2.25 2.25 0 0 1 21 7.5v9a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 16.5v-9z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Details & Controls */}
                    <div className="flex flex-col flex-1 justify-between min-w-0 gap-1.5">
                      <div className="flex items-start justify-between gap-1.5 min-w-0">
                        <Link
                          href={`/live-raffles/${item.slug || item.raffleId}`}
                          onClick={closeBasket}
                          className="font-heading font-bold text-[13px] sm:text-[14px] text-text-primary hover:text-text-brand truncate transition-colors leading-snug min-w-0 flex-1"
                          title={item.title}
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.raffleId)}
                          className="text-text-muted hover:text-red-600 transition-colors p-1 -mt-1 -mr-1 cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium truncate">
                        <span className="shrink-0">{formatCurrency(item.ticketPrice)} / ticket</span>
                        {item.category && (
                          <>
                            <span className="shrink-0">·</span>
                            <span className="text-text-brand capitalize font-semibold truncate">{item.category}</span>
                          </>
                        )}
                      </div>

                      {/* Quantity Stepper & Subtotal */}
                      <div className="flex items-center justify-between pt-2 mt-0.5 border-t border-divider gap-2">
                        <div className="flex items-center gap-1 bg-bg border border-border rounded-button p-0.5 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.raffleId, item.quantity - 1)}
                            disabled={item.quantity <= min}
                            className="w-6 h-6 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors text-sm"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="font-heading font-bold text-[12px] text-text-primary px-1.5 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.raffleId, item.quantity + 1)}
                            disabled={(max !== null && item.quantity >= max) || item.quantity >= remaining}
                            className="w-6 h-6 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors text-sm"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-heading font-bold text-[13px] sm:text-[14px] text-text-brand shrink-0">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer (Checkout Actions) */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-border bg-surface shrink-0 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 text-[13px]">
              <div className="flex items-center justify-between text-text-muted">
                <span>Total Tickets</span>
                <span className="font-semibold text-text-primary">{totalTicketsCount}</span>
              </div>
              <div className="flex items-center justify-between text-text-muted">
                <span>Shipping & Delivery</span>
                <span className="font-bold text-emerald-600 text-[11px] uppercase tracking-wider">Free (Included)</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-divider text-[15px] sm:text-[16px]">
                <span className="font-bold text-text-primary">Grand Total</span>
                <span className="font-heading font-extrabold text-[20px] sm:text-[22px] text-text-brand">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                closeBasket();
                router.push("/checkout");
              }}
              className="w-full h-[46px] sm:h-[48px] rounded-button bg-gradient-to-r from-primary to-[#8A46E4] hover:opacity-95 text-white font-sans font-bold text-[14px] sm:text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-glow uppercase tracking-wider px-3"
            >
              <span>Proceed to Checkout</span>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 pt-1 text-[11px] text-text-muted text-center sm:text-left">
              <Link
                href="/basket"
                onClick={closeBasket}
                className="hover:text-text-brand underline font-medium transition-colors"
              >
                View Full Basket Details
              </Link>
              <span className="flex items-center gap-1 font-semibold text-text-secondary">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                </svg>
                <span>UK Regulated Prize Draws</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
