import React from "react";

export function DashboardPreview() {
  return (
    <div className="relative w-full max-w-2xl mx-auto mt-10 rounded-2xl bg-night-800/40 backdrop-blur-md border border-white/8 shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),0_12_40px_rgba(0,0,0,0.6)] p-6 md:p-8 text-left font-display">
      {/* Decorative top soft glow corner */}
      <div 
        className="absolute top-0 left-1/4 -translate-y-1/2 w-48 h-12 bg-white/5 rounded-full blur-2xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Header section of dashboard */}
      <div className="flex items-center justify-between border-b border-divider pb-4 mb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted font-medium">
          Market Overview
        </span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-glow"></span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-faint">Live Network</span>
        </div>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        {/* Metric 1 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-muted">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-muted fill-none" strokeWidth="2">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M12 2v9M8 5h8" />
            </svg>
            <span className="text-[11px] uppercase tracking-wider font-medium">Total Value Locked</span>
          </div>
          <span className="text-xl md:text-2xl font-normal tracking-tight text-ink">
            $142,850,210
          </span>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-muted">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-muted fill-none" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span className="text-[11px] uppercase tracking-wider font-medium">Active Markets</span>
          </div>
          <span className="text-xl md:text-2xl font-normal tracking-tight text-ink">
            18
          </span>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-muted">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-muted fill-none" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="text-[11px] uppercase tracking-wider font-medium">Volatility Index</span>
          </div>
          <span className="text-xl md:text-2xl font-normal tracking-tight text-ink flex items-center gap-1.5">
            1.84% <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-faint">Low</span>
          </span>
        </div>
      </div>

      {/* Main dashboard content area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Top Trading Pairs list */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] uppercase tracking-wider text-muted font-medium border-b border-divider pb-2">
            Top Trading Pairs
          </span>
          <div className="flex flex-col gap-3">
            {/* Pair 1 */}
            <div className="flex items-center justify-between text-sm py-1">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                  T
                </div>
                <span className="font-medium text-ink">TWT / USDC</span>
              </div>
              <div className="text-right">
                <span className="block font-medium text-ink">$1.0002</span>
                <span className="text-[10px] text-muted">+0.04%</span>
              </div>
            </div>

            {/* Pair 2 */}
            <div className="flex items-center justify-between text-sm py-1">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                  E
                </div>
                <span className="font-medium text-ink">ETH / TWT</span>
              </div>
              <div className="text-right">
                <span className="block font-medium text-ink">$2,654.20</span>
                <span className="text-[10px] text-muted">-0.12%</span>
              </div>
            </div>

            {/* Pair 3 */}
            <div className="flex items-center justify-between text-sm py-1">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                  W
                </div>
                <span className="font-medium text-ink">WBTC / TWT</span>
              </div>
              <div className="text-right">
                <span className="block font-medium text-ink">$94,180.50</span>
                <span className="text-[10px] text-muted">+0.45%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 24h Price Trend line chart */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] uppercase tracking-wider text-muted font-medium border-b border-divider pb-2">
            24h Price Trend
          </span>
          <div className="h-32 w-full relative mt-2">
            <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Subtle Horizontal grid lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />

              {/* Price Line (Bezier Curve) */}
              <path
                d="M 0 85 C 40 80, 50 45, 100 55 C 150 65, 160 20, 200 35 C 240 50, 260 65, 300 25"
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              {/* Gradient Area under line */}
              <path
                d="M 0 85 C 40 80, 50 45, 100 55 C 150 65, 160 20, 200 35 C 240 50, 260 65, 300 25 L 300 100 L 0 100 Z"
                fill="url(#chart-gradient)"
              />
              
              {/* Glow dots on endpoint */}
              <circle cx="300" cy="25" r="3" fill="#ffffff" />
              <circle cx="300" cy="25" r="7" fill="#ffffff" className="animate-ping opacity-35" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
