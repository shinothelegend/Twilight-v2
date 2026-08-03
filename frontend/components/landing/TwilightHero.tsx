import Link from "next/link";

import {TwilightScene} from "@/components/landing/TwilightScene";
import {deployment} from "@/lib/contracts";

function Starburst() {
  return (
    <div className="pointer-events-none absolute h-[500px] w-[500px] select-none flex items-center justify-center" aria-hidden="true">
      {/* Soft atmospheric radial glow */}
      <div 
        className="anim-halo absolute h-[320px] w-[320px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,243,238,0.25) 0%, rgba(245,243,238,0.10) 35%, rgba(245,243,238,0.03) 60%, rgba(245,243,238,0) 80%)",
        }}
      />
      {/* Concentric faint rings to give it depth */}
      <div 
        className="absolute h-[240px] w-[240px] rounded-full border border-white/[0.03] bg-transparent"
      />
      <div 
        className="absolute h-[160px] w-[160px] rounded-full border border-white/[0.06] bg-transparent"
      />
      {/* The main SVG starburst flare */}
      <svg 
        viewBox="0 0 200 200" 
        className="absolute h-[380px] w-[380px] text-white opacity-85 mix-blend-screen"
      >
        <defs>
          <radialGradient id="flare-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="15%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id="core-blur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Central hot spot */}
        <circle cx="100" cy="100" r="16" fill="url(#flare-core)" />
        <circle cx="100" cy="100" r="8" fill="#ffffff" filter="url(#core-blur)" />

        {/* Long horizontal and vertical spike rays */}
        <path d="M 100 12 L 102 100 L 100 188 L 98 100 Z" fill="#ffffff" opacity="0.9" />
        <path d="M 12 100 L 100 102 L 188 100 L 100 98 Z" fill="#ffffff" opacity="0.9" />

        {/* Diagonal spike rays (45 deg) */}
        <path d="M 100 28 L 101.5 100 L 100 172 L 98.5 100 Z" fill="#ffffff" opacity="0.75" transform="rotate(45, 100, 100)" />
        <path d="M 100 28 L 101.5 100 L 100 172 L 98.5 100 Z" fill="#ffffff" opacity="0.75" transform="rotate(135, 100, 100)" />

        {/* Shorter intermediate spike rays for complexity */}
        <path d="M 100 52 L 101 100 L 100 148 L 99 100 Z" fill="#ffffff" opacity="0.55" transform="rotate(22.5, 100, 100)" />
        <path d="M 100 52 L 101 100 L 100 148 L 99 100 Z" fill="#ffffff" opacity="0.55" transform="rotate(67.5, 100, 100)" />
        <path d="M 100 52 L 101 100 L 100 148 L 99 100 Z" fill="#ffffff" opacity="0.55" transform="rotate(112.5, 100, 100)" />
        <path d="M 100 52 L 101 100 L 100 148 L 99 100 Z" fill="#ffffff" opacity="0.55" transform="rotate(157.5, 100, 100)" />
      </svg>
    </div>
  );
}

/**
 * Landing page. One screen, no scroll-jacking, one call to action.
 *
 * The scene is decorative and sits in a fixed layer behind this content, so the headline and CTA
 * are painted and interactive before any animation frame runs.
 */
export function TwilightHero() {
  return (
    <main className="relative flex min-h-dvh flex-col">
      <TwilightScene variant="landing" showMoon={false} />

      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="font-brand text-sm tracking-[0.32em] text-ink uppercase">Twilight</span>
        <span className="text-xs tracking-[0.18em] text-faint uppercase">Arbitrum Sepolia</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-16 pb-20 text-center sm:pt-24">
        <h1 className="font-display max-w-4xl text-[2.6rem] leading-[1.12] font-normal text-balance text-ink sm:text-6xl lg:text-[4.25rem]">
          Twilight DeFi: Secure,
          <br className="hidden sm:block" /> Cinematic Payments.
        </h1>

        <p className="mt-7 max-w-lg text-sm leading-relaxed text-pretty text-muted">
          Experience the future of decentralized finance in a professional,
          monochrome world. Seamless, secure, and beautifully simple.
        </p>

        {/* The CTA carries its own light source, echoing the moon above it. */}
        <div className="relative mt-12 flex items-center justify-center">
          <Starburst />
          <Link
            href="/app"
            className="relative z-10 rounded-full bg-glow px-10 py-3.5 text-sm font-semibold text-night-900 shadow-[0_0_24px_rgba(245,243,238,0.4)] transition-all duration-200 hover:bg-white hover:scale-[1.03] hover:shadow-[0_0_36px_rgba(255,255,255,0.7)] active:scale-[0.98]"
          >
            Launch App
          </Link>
        </div>

        <a
          href={deployment.explorer + "/address/" + deployment.deployer}
          target="_blank"
          rel="noreferrer"
          className="mt-10 text-xs tracking-[0.14em] text-faint uppercase transition-colors hover:text-muted"
        >
          View verified contracts on Arbiscan
        </a>
      </div>

      <footer className="px-6 pb-8 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 border-t border-divider pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>Testnet build · chain {deployment.chainId}</span>
          <span className="tracking-[0.14em] uppercase">
            Real balances · Real history · No placeholders
          </span>
        </div>
      </footer>
    </main>
  );
}
