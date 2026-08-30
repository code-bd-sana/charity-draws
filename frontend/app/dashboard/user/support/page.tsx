import React from "react";

export default function UserSupportPage() {
  return (
    <div className="p-8 max-w-[1660px] mx-auto w-full animate-fadeIn select-none">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">Help & Support</h1>
        <p className="font-sans text-sm text-text-muted font-medium">
          Get assistance, track support tickets, or search quick FAQs.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        
        {/* Left Column: Raise a Support Ticket */}
        <div className="flex-1 bg-surface border border-border rounded-card p-8 flex flex-col gap-6 shadow-card">
          <h2 className="font-heading font-bold text-[18px] text-text-primary border-b border-divider pb-3">
            Raise a Support Ticket
          </h2>

          <form className="flex flex-col gap-5">
            {/* Subject Field */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Subject
              </label>
              <input 
                type="text" 
                className="w-full h-[44px] bg-bg border border-border rounded-button px-4 text-[14px] text-text-primary font-sans focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>

            {/* Related Order ID Field */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Related Order ID (Optional)
              </label>
              <input 
                type="text" 
                placeholder="e.g. #TXN-8821"
                className="w-full h-[44px] bg-bg border border-border rounded-button px-4 text-[14px] text-text-primary font-sans placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>

            {/* Message Field */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Message
              </label>
              <textarea 
                placeholder="Describe your issue in detail..."
                className="w-full h-[180px] bg-bg border border-border rounded-button p-4 text-[14px] text-text-primary font-sans placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-none font-medium"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="button" 
              className="w-full h-[44px] bg-primary hover:bg-primary-hover text-white rounded-button font-sans font-semibold text-[15px] flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer mt-2"
            >
              Submit Ticket
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </form>
        </div>

        {/* Right Column: Support Tickets & Quick Answers */}
        <div className="w-full lg:w-[480px] flex flex-col gap-6 shrink-0">
          
          {/* My Support Tickets */}
          <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-5 shadow-card">
            <h2 className="font-heading font-bold text-[16px] text-text-primary border-b border-divider pb-3">
              My Support Tickets
            </h2>
            <div className="flex flex-col gap-4">
              
              {/* Ticket 1 */}
              <div className="flex items-start justify-between pb-4 border-b border-divider">
                <div className="flex flex-col gap-1">
                  <span className="font-sans font-semibold text-[13px] text-text-primary">Payment not processed</span>
                  <span className="font-sans text-[11px] text-text-muted font-medium">18 Jun 2025</span>
                </div>
                <div className="px-3 py-1 rounded-badge border border-amber-200 bg-amber-50 shadow-sm">
                  <span className="font-sans font-semibold text-[10px] text-amber-700 uppercase tracking-wide">Open</span>
                </div>
              </div>

              {/* Ticket 2 */}
              <div className="flex items-start justify-between pb-4 border-b border-divider">
                <div className="flex flex-col gap-1">
                  <span className="font-sans font-semibold text-[13px] text-text-primary">Raffle entry query</span>
                  <span className="font-sans text-[11px] text-text-muted font-medium">10 Jun 2025</span>
                </div>
                <div className="px-3 py-1 rounded-badge border border-emerald-200 bg-emerald-50 shadow-sm">
                  <span className="font-sans font-semibold text-[10px] text-emerald-700 uppercase tracking-wide">Resolved</span>
                </div>
              </div>

              {/* Ticket 3 */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-sans font-semibold text-[13px] text-text-primary">Account verification</span>
                  <span className="font-sans text-[11px] text-text-muted font-medium">02 Jun 2025</span>
                </div>
                <div className="px-3 py-1 rounded-badge border border-border bg-bg shadow-sm">
                  <span className="font-sans font-semibold text-[10px] text-text-muted uppercase tracking-wide">Closed</span>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Answers */}
          <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-5 shadow-card">
            <h2 className="font-heading font-bold text-[16px] text-text-primary border-b border-divider pb-3">
              Quick Answers
            </h2>
            <div className="flex flex-col">
              
              {["How do I claim my prize?", "Can I get a refund on tickets?", "How are winners selected?"].map((question, index) => (
                <button 
                  key={index}
                  className={`w-full flex items-center justify-between py-3.5 group cursor-pointer ${index !== 2 ? 'border-b border-divider' : ''}`}
                >
                  <span className="font-sans font-semibold text-[13px] text-text-muted group-hover:text-text-brand transition-colors">
                    {question}
                  </span>
                  <svg className="w-3.5 h-3.5 text-text-muted group-hover:text-text-brand transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
