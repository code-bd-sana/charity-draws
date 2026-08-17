import React from "react";
import Link from "next/link";
import { CONTACT_INFO_ITEMS } from "../../../data/contact/contact-info.data";

/**
 * Sidebar contact details stack including support schedule, FAQ promo,
 * and WhatsApp / email contact method cards.
 */
export default function ContactInfoCards() {
  // Renders card icon based on type
  const renderIcon = (type: string) => {
    switch (type) {
      case "email":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-text-brand"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        );
      case "whatsapp":
        return (
          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.685-.832-1.944-.927-.258-.094-.447-.143-.636.143-.189.285-.733.927-.899 1.116-.165.189-.33.214-.615.071-2.034-1.021-3.376-1.815-4.717-4.116-.356-.612.356-.568.955-1.764.107-.214.054-.403-.027-.546-.081-.143-.636-1.534-.871-2.096-.229-.547-.462-.473-.636-.482-.165-.008-.354-.01-.543-.01s-.497.071-.757.356c-.26.285-1.002.979-1.002 2.387 0 1.408 1.025 2.769 1.168 2.96.143.189 2.018 3.081 4.889 4.321 2.871 1.24 2.871.827 3.39.771.519-.057 1.685-.688 1.921-1.354.236-.665.236-1.236.165-1.354-.071-.118-.26-.189-.545-.332z"/>
          </svg>
        );
      case "time":
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-text-brand"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      
      {/* Quick Contact Info Cards */}
      {CONTACT_INFO_ITEMS.map((item) => (
        <div
          key={item.id}
          className="bg-surface border border-border rounded-card p-5 flex items-center justify-between gap-4 transition-all duration-200 hover:border-border-medium shadow-card group"
        >
          <div className="flex items-center gap-4 min-w-0">
            {/* Rounded Icon Circle */}
            <div className="w-10 h-10 rounded-full bg-accent-bg border border-border-medium flex items-center justify-center shrink-0">
              {renderIcon(item.type)}
            </div>
            
            {/* Card Body */}
            <div className="flex flex-col min-w-0">
              <span className="font-sans font-medium text-sm text-text-primary">
                {item.title}
              </span>
              {item.href ? (
                <a
                  href={item.href}
                  target={item.type === "whatsapp" ? "_blank" : undefined}
                  rel={item.type === "whatsapp" ? "noopener noreferrer" : undefined}
                  className="font-sans text-xs text-text-muted hover:text-text-brand truncate mt-0.5 font-medium"
                >
                  {item.value}
                </a>
              ) : (
                <span className="font-sans text-xs text-text-muted truncate mt-0.5 font-medium">
                  {item.value}
                </span>
              )}
            </div>
          </div>

          {/* Action CTA Button for WhatsApp */}
          {item.type === "whatsapp" && (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-badge bg-emerald-50 border border-emerald-200 text-emerald-700 font-sans text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <span>Chat</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          )}
        </div>
      ))}

      {/* Direct WhatsApp Callout Banner */}
      <a
        href="https://wa.me/447497113316?text=Hello%20Charity%20Draws%20Support%2C%20I%20have%20an%20inquiry"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-emerald-50 border border-emerald-200/80 rounded-card p-5 flex items-center justify-between group hover:border-emerald-400 hover:shadow-card transition-all duration-300 shadow-sm"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold shrink-0 shadow-sm text-lg">
            💬
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-emerald-950 group-hover:text-emerald-700 transition-colors">
              Chat on WhatsApp
            </h4>
            <p className="font-sans text-xs text-emerald-800 font-medium">
              Connect directly with Admin Support (+44 7497 113316)
            </p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 rounded-badge bg-emerald-600 text-white font-sans text-xs font-bold hover:bg-emerald-700 transition-all shrink-0 flex items-center gap-1.5 shadow-sm group-hover:translate-x-0.5">
          <span>Open</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </a>

      {/* FAQ Promo Card */}
      <div className="bg-accent-bg/60 border border-border-medium rounded-card p-6 flex flex-col items-start hover:border-primary transition-all duration-300 shadow-card">
        <h4 className="font-heading font-bold text-sm text-text-primary mb-2">
          Looking for quick answers?
        </h4>
        <p className="font-sans text-xs md:text-sm text-text-muted leading-relaxed mb-4 font-medium">
          Our FAQ covers the most common questions about entries, payments, and hosting.
        </p>
        <Link
          href="/pricing#faq"
          className="font-sans font-bold text-xs md:text-sm text-text-brand hover:underline flex items-center gap-1 group"
        >
          Visit our FAQ
          <span className="transition-transform duration-200 group-hover:translate-x-1">&#8594;</span>
        </Link>
      </div>

      {/* Support Hours Card */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col shadow-card">
        <h4 className="font-heading font-bold text-sm text-text-primary mb-4">
          Support Hours
        </h4>
        <div className="flex flex-col font-sans text-xs md:text-sm">
          {/* Mon-Fri */}
          <div className="flex justify-between py-2 border-b border-divider">
            <span className="text-text-muted font-medium">Monday – Friday</span>
            <span className="text-text-primary font-semibold">9:00am – 6:00pm GMT</span>
          </div>
          {/* Sat */}
          <div className="flex justify-between py-2 border-b border-divider">
            <span className="text-text-muted font-medium">Saturday</span>
            <span className="text-text-primary font-semibold">10:00am – 2:00pm GMT</span>
          </div>
          {/* Sun */}
          <div className="flex justify-between py-2">
            <span className="text-text-muted font-medium">Sunday</span>
            <span className="text-text-muted/50 font-medium">Closed</span>
          </div>
        </div>
      </div>

    </div>
  );
}
