"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../../features/auth/AuthContext";
import { contactService } from "../../../../services/contact.service";
import { toast } from "sonner";

const SUBJECT_OPTIONS = [
  { value: "", label: "Select an inquiry topic..." },
  { value: "Questions about a Draw", label: "Questions about a Draw" },
  { value: "Payment & Billing", label: "Payment & Billing Issues" },
  { value: "Prize Claim & Shipping", label: "Prize Claim & Shipping" },
  { value: "Technical Support", label: "Technical Support & Bug Report" },
  { value: "Account Verification", label: "Account Verification" },
  { value: "Other Inquiries", label: "Other Inquiries" },
];

const FAQS = [
  {
    question: "How do I claim my prize if I win?",
    answer:
      "If you win an instant win or main draw, our system immediately registers your win. Our prize fulfillment team will contact you via your registered email and phone number within 24-48 hours. Physical prizes are delivered tracked to your registered prize shipping address.",
  },
  {
    question: "How are winning tickets selected?",
    answer:
      "All draws use an automated, provably fair cryptographic random selection algorithm compliant with UK regulations. Winning ticket numbers cannot be predicted or manipulated by hosts or entrants.",
  },
  {
    question: "Can I get a refund on purchased tickets?",
    answer:
      "Under UK prize competition regulations, entries are non-refundable once allocated into a live draw pool. If an event or draw is cancelled by administrators, all tickets are refunded back to original payment methods.",
  },
  {
    question: "Where can I view my purchased tickets?",
    answer:
      "You can view all your active tickets, allocated numbers, and entry history anytime in your dashboard under 'My Tickets' section.",
    link: "/dashboard/user/tickets",
    linkText: "Go to My Tickets →",
  },
];

export default function UserSupportPage() {
  const { user } = useAuth();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Pre-populate with logged in user profile
  useEffect(() => {
    if (user) {
      if (!fullName) {
        const nameParts = [user.firstName, user.lastName].filter(Boolean).join(" ");
        if (nameParts) setFullName(nameParts);
      }
      if (!email && user.email) {
        setEmail(user.email);
      }
      if (!phone && user.phone) {
        setPhone(user.phone);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!subject) {
      setErrorMessage("Please select an inquiry topic.");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMessage("Please describe your query in at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedMessage = orderId.trim()
        ? `[Related Order/Ticket: ${orderId.trim()}]\n\n${message.trim()}`
        : message.trim();

      await contactService.sendContactMessage({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject,
        message: formattedMessage,
      });

      setSubmitSuccess(true);
      toast.success("Support ticket submitted! Our team will get back to you shortly.");
      setMessage("");
      setOrderId("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit support request. Please try again or reach out on WhatsApp.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary mb-1">
            Help & Customer Support
          </h1>
          <p className="font-sans text-sm text-text-muted">
            Have questions about your tickets, prizes, or account? Reach out to our dedicated UK support team.
          </p>
        </div>

        {/* Direct WhatsApp Quick Button */}
        <a
          href="https://wa.me/447497113316?text=Hello%20Charity%20Draws%20Support%2C%20I%20need%20assistance%20with%20my%20account"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs shadow-sm transition-all shrink-0 w-fit"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.685-.832-1.944-.927-.258-.094-.447-.143-.636.143-.189.285-.733.927-.899 1.116-.165.189-.33.214-.615.071-2.034-1.021-3.376-1.815-4.717-4.116-.356-.612.356-.568.955-1.764.107-.214.054-.403-.027-.546-.081-.143-.636-1.534-.871-2.096-.229-.547-.462-.473-.636-.482-.165-.008-.354-.01-.543-.01s-.497.071-.757.356c-.26.285-1.002.979-1.002 2.387 0 1.408 1.025 2.769 1.168 2.96.143.189 2.018 3.081 4.889 4.321 2.871 1.24 2.871.827 3.39.771.519-.057 1.685-.688 1.921-1.354.236-.665.236-1.236.165-1.354-.071-.118-.26-.189-.545-.332z"/>
          </svg>
          <span>Chat on WhatsApp</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Support Form */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-card p-6 sm:p-8 shadow-card flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-divider pb-4">
            <div>
              <h2 className="font-heading font-bold text-[18px] text-text-primary">
                Raise a Support Request
              </h2>
              <span className="text-[12px] text-text-muted">
                Our support team typically responds within 24 hours.
              </span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Support System Online" />
          </div>

          {/* Success Banner */}
          {submitSuccess ? (
            <div className="p-6 rounded-card bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col items-center text-center gap-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-lg text-emerald-900">
                Support Ticket Dispatched!
              </h3>
              <p className="text-xs text-emerald-700 max-w-md leading-relaxed">
                Thank you! We have received your query and dispatched an email notification to our customer support desk. We will respond back to <span className="font-semibold">{email}</span> shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitSuccess(false)}
                className="mt-2 px-5 py-2 rounded-button bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-semibold text-xs transition-colors cursor-pointer"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
              {errorMessage && (
                <div className="p-3.5 rounded-button bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-primary">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-[44px] bg-bg border border-border rounded-button px-3.5 text-[13px] text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-primary">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[44px] bg-bg border border-border rounded-button px-3.5 text-[13px] text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Topic / Subject & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-primary">
                    Inquiry Topic <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-[44px] bg-bg border border-border rounded-button px-3 text-[13px] text-text-primary focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-primary">
                    Contact Phone <span className="text-text-muted font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+44 7700 900123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-[44px] bg-bg border border-border rounded-button px-3.5 text-[13px] text-text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Related Order / Ticket ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-primary">
                  Related Order ID or Ticket Number <span className="text-text-muted font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. #ORD-2025-4421 or Ticket #108"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full h-[44px] bg-bg border border-border rounded-button px-3.5 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Detailed Message Textarea */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-primary">
                  Detailed Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Please describe your question or issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-bg border border-border rounded-button p-3.5 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[48px] bg-primary hover:bg-primary-hover text-white rounded-button font-sans font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Support Ticket</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Support Cards & FAQ */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Direct Support Channels */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-card flex flex-col gap-4">
            <h3 className="font-heading font-bold text-[16px] text-text-primary border-b border-divider pb-3">
              Direct Contact Channels
            </h3>

            {/* Email Card */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-button bg-bg border border-border hover:border-border-medium transition-colors">
              <div className="w-10 h-10 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center text-text-brand shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-heading font-bold text-[13px] text-text-primary">Official Email Desk</span>
                <a
                  href="mailto:info@charitydraws.co.uk"
                  className="font-sans text-[12px] text-text-brand hover:underline truncate font-medium mt-0.5"
                >
                  info@charitydraws.co.uk
                </a>
                <span className="text-[11px] text-text-muted mt-0.5">Inbox monitored 7 days a week</span>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="flex items-start justify-between gap-3 p-3.5 rounded-button bg-bg border border-border hover:border-border-medium transition-colors">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.685-.832-1.944-.927-.258-.094-.447-.143-.636.143-.189.285-.733.927-.899 1.116-.165.189-.33.214-.615.071-2.034-1.021-3.376-1.815-4.717-4.116-.356-.612.356-.568.955-1.764.107-.214.054-.403-.027-.546-.081-.143-.636-1.534-.871-2.096-.229-.547-.462-.473-.636-.482-.165-.008-.354-.01-.543-.01s-.497.071-.757.356c-.26.285-1.002.979-1.002 2.387 0 1.408 1.025 2.769 1.168 2.96.143.189 2.018 3.081 4.889 4.321 2.871 1.24 2.871.827 3.39.771.519-.057 1.685-.688 1.921-1.354.236-.665.236-1.236.165-1.354-.071-.118-.26-.189-.545-.332z"/>
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold text-[13px] text-text-primary">WhatsApp Live Support</span>
                  <span className="text-[12px] text-text-muted mt-0.5">+44 (0) 7497 113316</span>
                </div>
              </div>
              <a
                href="https://wa.me/447497113316?text=Hello%20Charity%20Draws%20Support%2C%20I%20need%20assistance%20with%20my%20account"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-badge bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all text-[11px] font-bold shrink-0 self-center"
              >
                Chat Now
              </a>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-button bg-bg border border-border">
              <div className="w-10 h-10 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center text-text-brand shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-bold text-[13px] text-text-primary">Turnaround & Hours</span>
                <span className="text-[12px] text-text-primary font-medium mt-0.5">Average response under 24 hours</span>
                <span className="text-[11px] text-text-muted mt-0.5">09:00 – 18:00 BST (UK Time)</span>
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-card flex flex-col gap-4">
            <h3 className="font-heading font-bold text-[16px] text-text-primary border-b border-divider pb-3">
              Frequently Asked Questions
            </h3>

            <div className="flex flex-col divide-y divide-border">
              {FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="py-3.5 first:pt-0 last:pb-0 flex flex-col">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left gap-3 group cursor-pointer"
                    >
                      <span className="font-heading font-bold text-[13px] text-text-primary group-hover:text-text-brand transition-colors">
                        {faq.question}
                      </span>
                      <svg
                        className={`w-4 h-4 text-text-muted transition-transform shrink-0 ${isOpen ? "rotate-180 text-text-brand" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    {isOpen && (
                      <div className="mt-2 text-[12px] text-text-muted leading-relaxed flex flex-col gap-2 animate-fadeIn">
                        <p>{faq.answer}</p>
                        {faq.link && (
                          <Link
                            href={faq.link}
                            className="text-text-brand hover:underline font-semibold text-[11px] w-fit"
                          >
                            {faq.linkText}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
