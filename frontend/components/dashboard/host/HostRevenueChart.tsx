interface HostRevenueChartProps {
  totalRevenue?: number;
}

export default function HostRevenueChart({ totalRevenue }: HostRevenueChartProps) {
  const displayRevenue = totalRevenue !== undefined 
    ? `£${Number(totalRevenue).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "£0.00";

  return (
    <div className="bg-surface border border-border rounded-card p-6 w-full flex flex-col h-full min-h-[362px] shadow-card select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-heading font-bold text-base md:text-lg text-text-primary">
          Earnings Overview
        </h2>
        
        {/* Time filters */}
        <div className="flex gap-1.5">
          {["7D", "1M", "3M", "1Y"].map((filter) => (
            <button
              key={filter}
              className={`rounded-badge px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                filter === "1M"
                  ? "bg-primary border-primary text-primary-text font-bold shadow-glow"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-medium hover:bg-accent-bg/40"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <p className="font-heading font-bold text-3xl md:text-4xl text-text-brand tracking-tight">
          {displayRevenue}
        </p>
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-2.5 py-0.5 rounded-badge text-xs flex items-center gap-1 shadow-sm">
          <span>▲ Live</span>
        </div>
      </div>

      <div className="flex-1 w-full pt-5 relative min-h-[200px]">
        {/* Placeholder SVG matching Figma's design intent for the Area Chart */}
        <div className="absolute inset-0 w-full h-full">
          <svg preserveAspectRatio="none" viewBox="0 0 875 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-primary">
            {/* Grid lines */}
            <path d="M47.5 170H875" stroke="#E6D8F7" strokeDasharray="4 4" />
            <path d="M47.5 127.5H875" stroke="#E6D8F7" strokeDasharray="4 4" />
            <path d="M47.5 85H875" stroke="#E6D8F7" strokeDasharray="4 4" />
            <path d="M47.5 42.5H875" stroke="#E6D8F7" strokeDasharray="4 4" />
            <path d="M47.5 0H875" stroke="#E6D8F7" strokeDasharray="4 4" />
            
            {/* Area Fill */}
            <path d="M47.5 150.5C124.5 150.5 201.5 120 278.5 120C355.5 120 432.5 70.5 509.5 70.5C586.5 70.5 663.5 130 740.5 130C817.5 130 875 42.5 875 42.5V170H47.5V150.5Z" fill="url(#paint0_linear)" fillOpacity="0.2" />
            
            {/* Line Path */}
            <path d="M47.5 150.5C124.5 150.5 201.5 120 278.5 120C355.5 120 432.5 70.5 509.5 70.5C586.5 70.5 663.5 130 740.5 130C817.5 130 875 42.5 875 42.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            
            <defs>
              <linearGradient id="paint0_linear" x1="461.25" y1="42.5" x2="461.25" y2="170" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7131C8" />
                <stop offset="1" stopColor="#7131C8" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
