import Link from "next/link";

import {TwilightScene} from "@/components/landing/TwilightScene";
import {deployment} from "@/lib/contracts";

/**
 * Landing page. One screen, no scroll-jacking, one call to action.
 *
 * The scene is decorative and sits in a fixed layer behind this content, so the headline and CTA
 * are painted and interactive before any animation frame runs.
 */
export function TwilightHero() {
  return (
    <main className="relative flex min-h-dvh flex-col">
      <TwilightScene variant="landing" />

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
          Send, receive, stake and track real assets on Arbitrum — in a monochrome interface built
          for legibility rather than spectacle. Every figure is read live from the chain.
        </p>

        {/* The CTA carries its own light source, echoing the moon above it. */}
        <div className="relative mt-12 flex items-center justify-center">
          <span
            aria-hidden
            className="anim-halo pointer-events-none absolute h-56 w-56 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(245,243,238,0.30) 0%, rgba(245,243,238,0.12) 34%, rgba(245,243,238,0) 66%)",
            }}
          />
          <Link
            href="/app"
            className="relative rounded-full border border-white/25 bg-white/[0.06] px-10 py-3.5 text-sm font-medium text-ink shadow-[0_0_38px_rgba(245,243,238,0.22)] backdrop-blur-sm transition-colors duration-200 hover:border-white/45 hover:bg-white/[0.12]"
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
