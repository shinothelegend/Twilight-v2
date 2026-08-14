"use client";

import Link from "next/link";
import {useState} from "react";
import {ConnectButton} from "@rainbow-me/rainbowkit";

import {TwilightScene} from "@/components/landing/TwilightScene";
import {AntigravityBackground} from "@/components/landing/AntigravityBackground";
import {DashboardPreview} from "@/components/landing/DashboardPreview";
import {deployment} from "@/lib/contracts";

/**
 * Landing page. One screen, no scroll-jacking, one call to action.
 *
 * The scene is decorative and sits in a fixed layer behind this content, so the headline and CTA
 * are painted and interactive before any animation frame runs.
 */
export function TwilightHero() {
  const [activeTab, setActiveTab] = useState<"about" | "features" | "docs" | "community" | null>(null);

  return (
    <main className="relative flex min-h-dvh flex-col font-display">
      <TwilightScene variant="landing" showMoon={false} />
      <AntigravityBackground />

      <header className="flex items-center justify-between px-6 py-6 sm:px-10 border-b border-divider font-display">
        <span className="font-display text-sm tracking-[0.2em] text-ink uppercase font-semibold">Twilight DeFi</span>
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setActiveTab("about")} 
            className="font-display text-xs tracking-[0.14em] text-muted transition-colors hover:text-ink uppercase focus:outline-none cursor-pointer"
          >
            About
          </button>
          <button 
            onClick={() => setActiveTab("features")} 
            className="font-display text-xs tracking-[0.14em] text-muted transition-colors hover:text-ink uppercase focus:outline-none cursor-pointer"
          >
            Features
          </button>
          <button 
            onClick={() => setActiveTab("docs")} 
            className="font-display text-xs tracking-[0.14em] text-muted transition-colors hover:text-ink uppercase focus:outline-none cursor-pointer"
          >
            Docs
          </button>
          <button 
            onClick={() => setActiveTab("community")} 
            className="font-display text-xs tracking-[0.14em] text-muted transition-colors hover:text-ink uppercase focus:outline-none cursor-pointer"
          >
            Community
          </button>
          <ConnectButton.Custom>
            {({account, chain, openConnectModal, openAccountModal, mounted}) => {
              const ready = mounted;
              if (!ready || !account) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="font-display text-xs tracking-[0.14em] text-muted transition-colors hover:text-ink uppercase font-bold focus:outline-none cursor-pointer"
                  >
                    Connect Wallet
                  </button>
                );
              }
              return (
                <button
                  onClick={openAccountModal}
                  className="font-display text-xs tracking-[0.14em] text-ink transition-colors hover:text-white uppercase font-bold focus:outline-none cursor-pointer"
                >
                  {account.displayName}
                </button>
              );
            }}
          </ConnectButton.Custom>
        </nav>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-16 pb-20 text-center sm:pt-24 font-display">
        <h1 className="font-display max-w-4xl text-[2.6rem] leading-[1.12] font-normal tracking-tight text-balance text-ink sm:text-6xl lg:text-[4.25rem]">
          Twilight DeFi: Secure,
          <br className="hidden sm:block" /> Cinematic Payments.
        </h1>

        <p className="mt-7 max-w-lg text-sm leading-relaxed text-pretty text-muted font-display font-normal opacity-85">
          Experience decentralized finance in a curated, monochrome world.
          <br className="hidden sm:block" /> Seamless, secure, and beautifully simple.
        </p>

        {/* Dashboard Preview Component */}
        <DashboardPreview />

        {/* Action Button positioned below the dashboard card */}
        <div className="relative mt-8 flex items-center justify-center">
          <Link
            href="/app"
            className="font-display rounded-full bg-glow px-10 py-3.5 text-xs font-bold tracking-[0.14em] uppercase text-night-900 transition-all duration-300 ease-[var(--ease-out-expo)] hover:bg-white hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(255,255,255,0.25)] active:scale-[0.97]"
          >
            Launch App
          </Link>
        </div>

        <a
          href={deployment.explorer + "/address/" + deployment.deployer}
          target="_blank"
          rel="noreferrer"
          className="mt-10 text-xs tracking-[0.14em] text-faint uppercase transition-colors hover:text-muted font-display"
        >
          View verified contracts on Arbiscan
        </a>
      </div>

      {/* Real Information Overlay Modals */}
      {activeTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-display">
          <div className="relative w-full max-w-2xl bg-night-800/90 backdrop-blur-lg border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_12_45px_rgba(0,0,0,0.8)] rounded-2xl p-6 md:p-8 text-left max-h-[85vh] overflow-y-auto quiet-scroll">
            <button 
              onClick={() => setActiveTab(null)} 
              className="absolute top-6 right-6 text-muted hover:text-ink transition-colors text-lg focus:outline-none cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>

            {activeTab === "about" && (
              <div>
                <h2 className="text-2xl font-normal text-ink mb-4">About Twilight DeFi</h2>
                <div className="space-y-4 text-sm leading-relaxed text-muted font-normal">
                  <p>
                    Twilight DeFi is a calm, cinematic wallet dashboard for Arbitrum Sepolia (chain <code className="text-ink">421614</code>). It is designed to prioritize legibility and strict verifiability rather than spectacle.
                  </p>
                  <p>
                    Built as a submission for the <strong className="text-ink">Arbitrum Open House Online Buildathon</strong> (HackQuest), the app aims to show that holding and monitoring crypto assets can feel like twilight—quiet, structured, and clear—rather than a chaotic casino floor.
                  </p>
                  <p>
                    The visual language is an argument made in another register: simple grayscale components, bare branch silhouettes framing the screen, and slow-drifting mist layers settle the mind, encouraging calm, deliberate interactions.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div>
                <h2 className="text-2xl font-normal text-ink mb-4">Core Principles</h2>
                <div className="space-y-4 text-sm font-normal">
                  <div className="border border-white/5 bg-white/[0.02] p-4 rounded-xl">
                    <h3 className="text-ink font-semibold mb-1">1. Only Real Chain Data</h3>
                    <p className="text-muted leading-relaxed">
                      Every figure shown is read live from the Arbitrum Sepolia network—including balances, staked principal, reward rates, and transaction history. There are no fixtures, mock demo paths, or fake values. If a query is slow, a skeleton renders; if it fails, the RPC error message is displayed openly.
                    </p>
                  </div>
                  <div className="border border-white/5 bg-white/[0.02] p-4 rounded-xl">
                    <h3 className="text-ink font-semibold mb-1">2. Derived Truths Only</h3>
                    <p className="text-muted leading-relaxed">
                      The dashboard displays no fiat total, because TWLT is a testnet asset without market valuation—any aggregated aggregate value would be an invented estimate. APR values are mathematically derived directly from the contracts' active parameters and total pool stake.
                    </p>
                  </div>
                  <div className="border border-white/5 bg-white/[0.02] p-4 rounded-xl">
                    <h3 className="text-ink font-semibold mb-1">3. Grayscale Visual Discipline</h3>
                    <p className="text-muted leading-relaxed">
                      The color palette is strictly monochrome, except for the moon glow. Asset movement directions and gains are represented via text weights and arrow glyphs (↑ or ↓) rather than flashing green/red, training the eye to inspect metrics intentionally.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "docs" && (
              <div>
                <h2 className="text-2xl font-normal text-ink mb-4">Architecture & Code</h2>
                <div className="space-y-4 text-sm leading-relaxed text-muted font-normal">
                  <p>
                    Twilight DeFi operates entirely on-chain. Addresses are synchronized using Forge scripts directly from the contract deployment pipeline into the typescript interface module, preventing manual config drift.
                  </p>
                  <p className="text-ink font-semibold">Key Contracts:</p>
                  <ul className="list-disc list-inside space-y-2 border-l border-white/10 pl-4">
                    <li>
                      <strong className="text-ink">TwilightToken (TWLT)</strong>: A standard ERC-20 token with a hard-capped supply of 100,000,000. Features a rate-limited faucet yielding 100 TWLT every 24 hours per address.
                    </li>
                    <li>
                      <strong className="text-ink">TwilightStaking</strong>: A custom accumulator staking contract. Solvency is enforced by physical construction: staking principal is kept separate from rewards to prevent pool insolvency. Fully protected by reentrancy guards.
                    </li>
                  </ul>
                  <p>
                    <strong className="text-ink">Direct Log Parsing:</strong> The transaction list parses logs straight from event topics (`Transfer`, `Staked`, `Withdrawn`, `RewardPaid`) without depending on external indexing APIs. Large query spans are dynamically partitioned on-the-fly to stay within public RPC limits.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "community" && (
              <div>
                <h2 className="text-2xl font-normal text-ink mb-4">Community & Verification</h2>
                <div className="space-y-4 text-sm leading-relaxed text-muted font-normal">
                  <p>
                    Twilight DeFi is open-source under the MIT license. Both deployed contracts are verified on Arbiscan Sepolia.
                  </p>
                  <div className="space-y-2 border border-white/5 bg-white/[0.01] p-4 rounded-xl text-xs tnum">
                    <div className="flex justify-between border-b border-divider pb-2 flex-col sm:flex-row gap-1">
                      <span className="text-muted font-semibold">TwilightToken (TWLT)</span>
                      <a href="https://sepolia.arbiscan.io/address/0x6ab1B7ec49c0AcA914311754e304e46b2739950D#code" target="_blank" rel="noreferrer" className="text-ink hover:underline break-all">
                        0x6ab1B7ec49c0AcA914311754e304e46b2739950D
                      </a>
                    </div>
                    <div className="flex justify-between border-b border-divider py-2 flex-col sm:flex-row gap-1">
                      <span className="text-muted font-semibold">TwilightStaking</span>
                      <a href="https://sepolia.arbiscan.io/address/0x8cdD5E290E7F76257e2D47Cc34D98283eea044Ca#code" target="_blank" rel="noreferrer" className="text-ink hover:underline break-all">
                        0x8cdD5E290E7F76257e2D47Cc34D98283eea044Ca
                      </a>
                    </div>
                    <div className="flex justify-between pt-2 flex-col sm:flex-row gap-1">
                      <span className="text-muted font-semibold">Deployer / Owner</span>
                      <a href="https://sepolia.arbiscan.io/address/0x6b320D758485B9b8cB62010cf8D5AF94849e896B" target="_blank" rel="noreferrer" className="text-ink hover:underline break-all">
                        0x6b320D758485B9b8cB62010cf8D5AF94849e896B
                      </a>
                    </div>
                  </div>
                  <p>
                    For community questions, bug reports, and contributions, check the project repository:
                  </p>
                  <a 
                    href="https://github.com/shinothelegend/Twilight" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1 text-ink border border-white/10 hover:border-white/30 px-4 py-2 rounded-lg bg-white/[0.02] text-xs transition-all tracking-wider uppercase font-semibold"
                  >
                    View shinothelegend/Twilight on GitHub
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="px-6 pb-8 sm:px-10 font-display">
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
