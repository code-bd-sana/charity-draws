"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../features/auth/AuthContext";
import { useBasket } from "../../features/basket/BasketContext";
import { formatCurrency } from "../../lib/utils";
import { api } from "../../services/api";
import { useQueryClient } from "@tanstack/react-query";
import { ticketKeys, raffleKeys } from "../../hooks/queryKeys";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { items, totalTicketsCount, totalAmount, clearBasket } = useBasket();

  // Contact Information Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Prize Shipping Address Form
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country] = useState("United Kingdom");

  // Submission & Result States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<any | null>(null);

  // Auto-populate from logged-in user profile
  useEffect(() => {
    if (user) {
      if (user.firstName && !firstName) setFirstName(user.firstName);
      if (user.lastName && !lastName) setLastName(user.lastName);
      if (user.email && !email) setEmail(user.email);
      if (user.phone && !phone) setPhone(user.phone);
      if (user.location && !city) setCity(user.location);

      if (user.address && !addressLine1) {
        // Try parsing address parts if comma-separated
        const parts = user.address.split(",").map((p: string) => p.trim());
        if (parts.length >= 1) setAddressLine1(parts[0]);
        if (parts.length >= 3 && !city) setCity(parts[parts.length - 2]);
        if (parts.length >= 2 && !postalCode) setPostalCode(parts[parts.length - 1]);
      }
    }
  }, [user]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    // 1. Validate required fields
    if (!firstName.trim()) {
      setCheckoutError("First Name is required.");
      return;
    }
    if (!lastName.trim()) {
      setCheckoutError("Last Name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setCheckoutError("A valid Email Address is required for ticket confirmation.");
      return;
    }
    if (!phone.trim()) {
      setCheckoutError("Contact Phone is required for prize delivery notifications.");
      return;
    }
    if (!addressLine1.trim()) {
      setCheckoutError("Address Line 1 is required for prize delivery.");
      return;
    }
    if (!city.trim()) {
      setCheckoutError("Town / City is required.");
      return;
    }
    if (!postalCode.trim()) {
      setCheckoutError("Postal Code is required.");
      return;
    }

    if (items.length === 0) {
      setCheckoutError("Your basket is empty. Please add competition tickets first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        items: items.map((item) => ({
          raffleId: item.raffleId,
          quantity: item.quantity,
        })),
        contactInfo: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
        shippingAddress: {
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          postalCode: postalCode.trim(),
          country,
        },
      };

      const response = await api.post("/tickets/checkout", payload);
      const data = response.data;

      // Invalidate relevant queries so balances and ticket listings refresh
      queryClient.invalidateQueries({ queryKey: ticketKeys.my() });
      queryClient.invalidateQueries({ queryKey: raffleKeys.all });

      // Clear the local basket
      clearBasket();

      toast.success("Order confirmed! Your tickets have been allocated.");
      setOrderResult(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to complete checkout. Please review your details and try again.";
      setCheckoutError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Auth Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg font-sans">
        <WebsiteNavbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-heading font-semibold text-[14px] text-text-muted">
              Loading secure checkout...
            </span>
          </div>
        </main>
        <WebsiteFooter />
      </div>
    );
  }

  // 2. Unauthenticated Gate: "login kora chara kew checkout page e jte parba na"
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-bg font-sans">
        <WebsiteNavbar />
        <main className="flex-1 pt-28 pb-16 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-surface border border-border rounded-card p-8 shadow-card flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center text-text-brand mb-4 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>

            <h2 className="font-heading font-extrabold text-[22px] text-text-primary mb-2">
              Sign In Required for Checkout
            </h2>
            <p className="font-sans text-[13px] text-text-muted leading-relaxed mb-6">
              To comply with UK prize draw regulations and securely allocate your draw tickets, you must be logged in to an account.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/login?redirect=/checkout"
                className="w-full h-12 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-bold text-[14px] transition-all flex items-center justify-center shadow-sm uppercase tracking-wider"
              >
                Log In to Continue
              </Link>
              <Link
                href="/register?redirect=/checkout"
                className="w-full h-12 rounded-button bg-bg border border-border hover:bg-accent-bg text-text-primary font-sans font-semibold text-[14px] transition-colors flex items-center justify-center"
              >
                Create New Account
              </Link>
            </div>
          </div>
        </main>
        <WebsiteFooter />
      </div>
    );
  }

  // 3. Post-Purchase Success Screen
  if (orderResult) {
    const tickets = orderResult.tickets || [];
    const instantWins = orderResult.instantWins || [];

    return (
      <div className="min-h-screen flex flex-col bg-bg font-sans">
        <WebsiteNavbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container-custom max-w-3xl">
            <div className="bg-surface border border-border rounded-card p-8 sm:p-10 shadow-card flex flex-col items-center text-center animate-fadeIn">
              
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 mb-5 shadow-glow">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>

              <span className="px-3 py-1 rounded-badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-2">
                Order Completed Successfully
              </span>

              <h1 className="font-heading font-extrabold text-[28px] sm:text-[34px] text-text-primary mb-2">
                Thank You, {firstName}!
              </h1>
              <p className="font-sans text-[14px] text-text-muted max-w-lg mb-6 leading-relaxed">
                Your entries have been recorded and ticket numbers have been securely assigned. A confirmation email has been dispatched to <span className="font-semibold text-text-primary">{email}</span>.
              </p>

              {/* Instant Wins Celebration Banner */}
              {instantWins.length > 0 && (
                <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-2 border-amber-400 rounded-card p-5 mb-6 text-left animate-bounce">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[20px]">🎉</span>
                    <h3 className="font-heading font-extrabold text-[18px] text-amber-900">
                      INSTANT WIN PRIZE DETECTED!
                    </h3>
                  </div>
                  <p className="font-sans text-[13px] text-amber-800 leading-relaxed">
                    Congratulations! One or more of your allocated tickets is an instant winner:
                  </p>
                  <ul className="mt-2 list-disc list-inside text-[13px] font-bold text-amber-900">
                    {instantWins.map((win: any) => (
                      <li key={win.id}>
                        {win.prizeName} (Ticket #{win.ticketId || "Instant Winner"})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-amber-700">
                    Our prize fulfillment team has been notified and will contact you via {phone} for immediate delivery dispatch!
                  </p>
                </div>
              )}

              {/* Ticket Numbers Summary Box */}
              <div className="w-full bg-bg border border-border rounded-card p-5 mb-8 text-left">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <span className="font-heading font-bold text-[14px] text-text-primary">
                    Allocated Ticket Numbers ({tickets.length})
                  </span>
                  <span className="text-[12px] text-text-muted font-medium">
                    Total Paid: <span className="font-bold text-text-brand">{formatCurrency(orderResult.totalAmount || totalAmount)}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto custom-scrollbar p-1">
                  {tickets.map((t: any) => (
                    <span
                      key={t.id || t.ticketNumber}
                      className="px-2.5 py-1 rounded-badge bg-surface border border-border-medium font-mono font-bold text-[12px] text-text-brand shadow-xs"
                    >
                      #{t.ticketNumber}
                    </span>
                  ))}
                </div>
              </div>

              {/* Shipping Address Confirmation */}
              <div className="w-full bg-surface border border-divider rounded-button p-4 mb-8 text-left text-[13px]">
                <span className="font-bold text-text-muted uppercase text-[11px] tracking-wider block mb-1">
                  Registered Prize Shipping Address
                </span>
                <span className="text-text-primary font-medium block">
                  {addressLine1}{addressLine2 ? `, ${addressLine2}` : ""}, {city}, {postalCode}, {country}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <Link
                  href="/dashboard/user/tickets"
                  className="w-full sm:flex-1 h-12 rounded-button bg-primary hover:bg-primary-hover text-white font-sans font-bold text-[14px] transition-all flex items-center justify-center shadow-sm uppercase tracking-wider"
                >
                  View My Tickets & Draws
                </Link>
                <Link
                  href="/live-raffles"
                  className="w-full sm:flex-1 h-12 rounded-button bg-bg border border-border hover:bg-accent-bg text-text-primary font-sans font-semibold text-[14px] transition-colors flex items-center justify-center"
                >
                  Enter More Competitions
                </Link>
              </div>

            </div>
          </div>
        </main>
        <WebsiteFooter />
      </div>
    );
  }

  // 4. Main Checkout Form Screen
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
            <Link href="/basket" className="hover:text-text-brand transition-colors">
              Basket
            </Link>
            <span>/</span>
            <span className="text-text-primary font-semibold">Checkout</span>
          </div>

          <h1 className="font-heading font-extrabold text-[28px] sm:text-[34px] text-text-primary mb-2">
            Secure Checkout
          </h1>
          <p className="font-sans text-[14px] text-text-muted mb-8">
            Complete your entrant information and delivery shipping address for prize fulfillment.
          </p>

          {checkoutError && (
            <div className="mb-6 p-4 rounded-button bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
              </svg>
              <span>{checkoutError}</span>
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* SECTION 1: Contact Information */}
              <div className="bg-surface border border-border rounded-card p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[13px]">
                    1
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-[18px] text-text-primary">
                      Contact Information
                    </h2>
                    <span className="text-[12px] text-text-muted">
                      Used for ticket ownership confirmation and draw alerts.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-text-primary">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-11 px-3.5 bg-bg border border-border rounded-button text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-text-primary">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-11 px-3.5 bg-bg border border-border rounded-button text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-text-primary">
                      Email Address (Ticket Confirmation) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 px-3.5 bg-bg border border-border rounded-button text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-text-primary">
                      Contact Phone (Delivery Notifications) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+44 7700 900123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 px-3.5 bg-bg border border-border rounded-button text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Prize Shipping Address */}
              <div className="bg-surface border border-border rounded-card p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[13px]">
                    2
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-[18px] text-text-primary">
                      Prize Shipping Address
                    </h2>
                    <span className="text-[12px] text-text-muted">
                      Where physical prizes or tracked delivery items will be dispatched if you win.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Address Line 1 */}
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-text-primary">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="House number and street name"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="h-11 px-3.5 bg-bg border border-border rounded-button text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-text-primary">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Apartment, suite, unit, building floor"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="h-11 px-3.5 bg-bg border border-border rounded-button text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Town / City */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-text-primary">
                      Town / City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manchester"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-11 px-3.5 bg-bg border border-border rounded-button text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Postal Code */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-text-primary">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. M1 1AA"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="h-11 px-3.5 bg-bg border border-border rounded-button text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors uppercase"
                    />
                  </div>

                  {/* Country */}
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-text-primary">
                      Country
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={country}
                      className="h-11 px-3.5 bg-bg/80 border border-border rounded-button text-[13px] text-text-secondary cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Confirm & Pay */}
            <div className="lg:col-span-4 flex flex-col gap-5 sticky top-28">
              <div className="bg-surface border border-border rounded-card p-6 shadow-sm flex flex-col gap-4">
                <h3 className="font-heading font-bold text-[18px] text-text-primary border-b border-border pb-3">
                  Order Summary
                </h3>

                {/* Items Mini List */}
                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1 divide-y divide-border">
                  {items.map((item) => (
                    <div key={item.raffleId} className="pt-2 first:pt-0 flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="font-heading font-bold text-[13px] text-text-primary truncate">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {item.quantity} × {formatCurrency(item.ticketPrice)}
                        </span>
                      </div>
                      <span className="font-heading font-bold text-[13px] text-text-brand shrink-0">
                        {formatCurrency(item.quantity * Number(item.ticketPrice || 0))}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-border text-[13px]">
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Total Tickets</span>
                    <span className="font-semibold text-text-primary">{totalTicketsCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-text-muted">
                    <span>Subtotal</span>
                    <span className="font-semibold text-text-primary">{formatCurrency(totalAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between text-text-muted">
                    <span>Prize Delivery</span>
                    <span className="font-bold text-emerald-600 text-[11px] uppercase">Free (Included)</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-divider text-[18px]">
                    <span className="font-bold text-text-primary">Total to Pay</span>
                    <span className="font-heading font-extrabold text-[24px] text-text-brand">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Confirm & Pay Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full h-[52px] mt-2 rounded-button bg-gradient-to-r from-primary to-[#8A46E4] hover:opacity-95 text-white font-sans font-bold text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-glow disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Allocating Tickets...</span>
                    </>
                  ) : (
                    <span>Confirm & Pay — {formatCurrency(totalAmount)}</span>
                  )}
                </button>

                <p className="text-[11px] text-text-muted text-center leading-normal">
                  By clicking Confirm & Pay, you agree to our Competition Terms & Conditions.
                </p>

                <div className="flex flex-col gap-2 pt-3 border-t border-divider text-[11px] text-text-muted">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                    </svg>
                    <span>Instant Ticket Allocation & Draw Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    <span>Automated Instant Win Detection</span>
                  </div>
                </div>

              </div>
            </div>

          </form>

        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
}
