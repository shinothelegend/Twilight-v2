"use client";

import {ConnectButton} from "@rainbow-me/rainbowkit";
import Link from "next/link";

import {Button} from "@/components/ui/primitives";
import {ThemeToggle} from "@/components/ui/ThemeToggle";
import {useTour} from "@/components/tour/TourContext";

/**
 * Top navigation. The connect control is RainbowKit's headless `ConnectButton.Custom`, so the
 * button itself is ours and stays inside the grayscale palette; only the wallet modal is
 * RainbowKit's, re-themed in providers.tsx.
 */
export function TopNav() {
  const {startTour} = useTour();

  return (
    <nav className="sticky top-0 z-20 border-b border-divider bg-night-900/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-baseline gap-8">
          <Link
            href="/"
            className="font-brand text-sm tracking-[0.32em] text-ink uppercase transition-colors hover:text-white"
          >
            Twilight
          </Link>
          <span className="hidden text-xs tracking-[0.18em] text-faint uppercase sm:inline">
            Arbitrum Sepolia
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton.Custom>
            {({account, chain, openAccountModal, openChainModal, openConnectModal, mounted}) => {
              const ready = mounted;
              if (!ready) {
                return <div className="h-10 w-32 rounded-xl border border-edge/50" />;
              }

              if (!account || !chain) {
                return <Button onClick={openConnectModal} data-tour="connect-button">Connect wallet</Button>;
              }

              if (chain.unsupported) {
                return (
                  <Button variant="ghost" onClick={openChainModal}>
                    Switch to Arbitrum Sepolia
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="hidden rounded-xl border border-edge px-3 py-2 text-xs tracking-[0.12em] text-muted uppercase transition-colors hover:border-muted hover:text-ink sm:block"
                  >
                    {chain.name}
                  </button>
                  <Button variant="ghost" onClick={openAccountModal} className="tnum" data-tour="connect-button">
                    {account.displayName}
                  </Button>
                </div>
              );
            }}
          </ConnectButton.Custom>
          <button
            onClick={startTour}
            title="Restart guided tour"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-edge text-muted transition-colors hover:border-muted hover:text-ink focus:outline-none"
          >
            ?
          </button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
