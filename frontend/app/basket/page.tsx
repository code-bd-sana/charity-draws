"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBasket } from "../../features/basket/BasketContext";
import { formatCurrency } from "../../lib/utils";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";

export default function BasketPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearBasket,
    totalTicketsCount,
    totalAmount,
  } = useBasket();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-bg font-sans">
      <WebsiteNavbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="container-custom max-w-6xl">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[12px] text-text-muted mb-6">
            <Link href="/" className="hover:text-text-brand transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-text-primary font-semibold">Basket</span>
          </div>

          {/* Page Heading */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-extrabold text-[28px] sm:text-[34px] text-text-primary leading-tight">
                Your Basket
              </h1>
              <p className="font-sans text-[14px] text-text-muted mt-1">
                Review your competition entries before entering the draw.
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={clearBasket}
                className="text-[12px] text-text-muted hover:text-red-600 transition-colors font-medium cursor-pointer"
              >
                Clear Entire Basket
              </button>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty State */
            <div className="bg-surface border border-border rounded-card p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm max-w-xl mx-auto my-8">
              <div className="w-20 h-20 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center text-text-brand shadow-sm">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <h2 className="font-heading font-bold text-[22px] text-text-primary">
                Your basket is currently empty
              </h2>
              <p className="font-sans text-[14px] text-text-muted max-w-md leading-relaxed">
                You haven&apos;t added any tickets yet. Explore our active draws to win luxury tech, cars, cash, and experiences!
              </p>
              <Link
                href="/live-raffles"
                className="mt-2 px-8 py-3.5 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-bold text-[14px] transition-all shadow-glow uppercase tracking-wider"
              >
                Browse Live Competitions
              </Link>
            </div>
          ) : (
            /* Items & Summary Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Items */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="bg-surface border border-border rounded-card overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-accent-bg/20 hidden sm:grid grid-cols-12 text-[12px] font-bold text-text-muted uppercase tracking-wider">
                    <span className="col-span-6">Competition</span>
                    <span className="col-span-2 text-center">Ticket Price</span>
                    <span className="col-span-2 text-center">Quantity</span>
                    <span className="col-span-2 text-right">Subtotal</span>
                  </div>

                  <div className="divide-y divide-border">
                    {items.map((item) => {
                      const itemTotal = item.quantity * Number(item.ticketPrice || 0);
                      const min = item.minTickets || 1;
                      const max = item.maxTickets ?? null;
                      const remaining = Math.max(0, item.totalTickets - item.ticketsSold);

                      return (
                        <div
                          key={item.raffleId}
                          className="p-5 sm:px-6 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-4 hover:bg-accent-bg/10 transition-colors"
                        >
                          {/* Competition Details */}
                          <div className="sm:col-span-6 flex items-center gap-3.5 sm:gap-4 min-w-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent-bg border border-border rounded-button overflow-hidden shrink-0">
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

                            <div className="flex flex-col flex-1 min-w-0 pr-1">
                              <Link
                                href={`/live-raffles/${item.slug || item.raffleId}`}
                                className="font-heading font-bold text-[14px] sm:text-[15px] text-text-primary hover:text-text-brand transition-colors line-clamp-2 leading-snug break-words"
                              >
                                {item.title}
                              </Link>
                              {item.category && (
                                <span className="text-[11px] text-text-brand font-semibold capitalize mt-0.5">
                                  {item.category}
                                </span>
                              )}
                              <button
                                onClick={() => removeItem(item.raffleId)}
                                className="text-[11px] text-text-muted hover:text-red-600 transition-colors w-fit mt-1.5 font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>

                          {/* Price Per Ticket */}
                          <div className="sm:col-span-2 sm:text-center text-[13px] font-semibold text-text-secondary flex sm:block items-center justify-between">
                            <span className="sm:hidden text-text-muted font-normal">Ticket Price:</span>
                            <span>{formatCurrency(item.ticketPrice)}</span>
                          </div>

                          {/* Quantity Stepper */}
                          <div className="sm:col-span-2 flex items-center sm:justify-center justify-between">
                            <span className="sm:hidden text-text-muted text-[13px]">Quantity:</span>
                            <div className="flex items-center gap-1.5 bg-bg border border-border rounded-button p-0.5">
                              <button
                                onClick={() => updateQuantity(item.raffleId, item.quantity - 1)}
                                disabled={item.quantity <= min}
                                className="w-7 h-7 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              >
                                -
                              </button>
                              <span className="font-heading font-bold text-[13px] text-text-primary px-2 min-w-[28px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.raffleId, item.quantity + 1)}
                                disabled={(max !== null && item.quantity >= max) || item.quantity >= remaining}
                                className="w-7 h-7 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Line Total */}
                          <div className="sm:col-span-2 sm:text-right font-heading font-extrabold text-[16px] text-text-brand flex sm:block items-center justify-between">
                            <span className="sm:hidden font-sans text-text-muted text-[13px] font-normal">Subtotal:</span>
                            <span>{formatCurrency(itemTotal)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    href="/live-raffles"
                    className="inline-flex items-center gap-2 text-text-brand hover:underline font-semibold text-[13px] transition-colors"
                  >
                    <span>← Continue Browsing Competitions</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="lg:col-span-4 flex flex-col gap-5 sticky top-28">
                <div className="bg-surface border border-border rounded-card p-6 shadow-sm flex flex-col gap-4">
                  <h3 className="font-heading font-bold text-[18px] text-text-primary border-b border-border pb-3">
                    Order Summary
                  </h3>

                  <div className="flex flex-col gap-2.5 text-[14px]">
                    <div className="flex items-center justify-between text-text-muted">
                      <span>Total Tickets</span>
                      <span className="font-semibold text-text-primary">{totalTicketsCount}</span>
                    </div>

                    <div className="flex items-center justify-between text-text-muted">
                      <span>Subtotal</span>
                      <span className="font-semibold text-text-primary">{formatCurrency(totalAmount)}</span>
                    </div>

                    <div className="flex items-center justify-between text-text-muted">
                      <span>Prize Shipping & Delivery</span>
                      <span className="font-bold text-emerald-600 text-[12px] uppercase">Free (Included)</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-divider text-[18px]">
                      <span className="font-bold text-text-primary">Total to Pay</span>
                      <span className="font-heading font-extrabold text-[24px] text-text-brand">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full h-[50px] mt-2 rounded-button bg-gradient-to-r from-primary to-[#8A46E4] hover:opacity-95 text-white font-sans font-bold text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-glow uppercase tracking-wider"
                  >
                    <span>Proceed to Checkout</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </button>

                  <div className="flex flex-col gap-2 pt-3 border-t border-divider text-[12px] text-text-muted">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                      </svg>
                      <span>100% Encrypted & Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                      </svg>
                      <span>Provably Fair & Audited Automated Draws</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM9 5a1 1 0 0 1 2 0v5a1 1 0 0 1-.293.707l-3 3a1 1 0 0 1-1.414-1.414L9 9.586V5Z" clipRule="evenodd" />
                      </svg>
                      <span>Guaranteed Draw Dates (No Extensions)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
}
