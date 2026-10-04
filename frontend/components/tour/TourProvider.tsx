"use client";

import React, {useState, useEffect, useMemo, useCallback} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useAccount} from "wagmi";
import {useStaking} from "@/lib/hooks/useStaking";
import {TourContext, TourStep} from "./TourContext";
import {TourOverlay} from "./TourOverlay";
import {TourPopover} from "./TourPopover";

export function TourProvider({children}: {children: React.ReactNode}) {
  const [tourActive, setTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const {isConnected} = useAccount();
  const staking = useStaking();

  const startTour = useCallback(() => {
    setTourActive(true);
    setCurrentStepIndex(0);
    if (pathname !== "/app") {
      router.push("/app");
    }
  }, [pathname, router]);

  const endTour = useCallback(() => {
    setTourActive(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("twilight-tour-done", "true");
    }
  }, []);

  const goNext = useCallback(() => {
    setCurrentStepIndex((i) => i + 1);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const fillAmount = useCallback((amount: string) => {
    // We can dispatch a custom event that the stake input listens to
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("twilight-tour-fill", {detail: amount}));
    }
  }, []);

  // Compute adaptive steps
  const steps = useMemo(() => {
    const s: TourStep[] = [];
    
    s.push({
      id: "welcome",
      anchor: null,
      title: "Welcome",
      body: "Twilight shows only numbers the chain can prove. This 2-minute tour walks you through your first real on-chain transaction — connect, fund, stake, claim.",
      primaryAction: "next"
    });

    if (!isConnected) {
      s.push({
        id: "connect",
        anchor: '[data-tour="connect-button"]',
        title: "Connect",
        body: "Connect any wallet on Arbitrum Sepolia. This is a testnet — no real funds involved.",
        waitForTx: "connect"
      });
    }

    const walletBal = staking.walletBalance ?? 0n;
    if (walletBal < 1000000000000000000n) { // less than 1 TWLT
      s.push({
        id: "faucet",
        anchor: '[data-tour="faucet-claim"]',
        fallbackAnchor: '[data-tour="nav-faucet"]',
        title: "Faucet",
        body: "Claim 100 TWLT. The 24h cooldown is enforced by the contract itself, not by this page.",
        fallbackBody: "Your wallet is empty. Click the Faucet tab — the arrow points the way.",
        waitForTx: "faucet"
      });
    }

    const allowance = staking.allowance ?? 0n;
    if (allowance === 0n) {
      s.push({
        id: "approve",
        anchor: '[data-tour="stake-approve"]',
        fallbackAnchor: '[data-tour="nav-stake"]',
        title: "Approve",
        body: "Before staking, you approve the pool to move your TWLT. This is a one-time ERC-20 approval.",
        fallbackBody: "Click the Staking tab to continue.",
        waitForTx: "approve"
      });
    }

    const stakedBal = staking.stakedBalance ?? 0n;
    if (stakedBal === 0n) {
      s.push({
        id: "stake",
        anchor: '[data-tour="stake-button"]', // changed from stake-amount for simplicity
        fallbackAnchor: '[data-tour="nav-stake"]',
        title: "Stake",
        body: "Enter an amount to stake, then click Stake. You can use the shortcut below.",
        fallbackBody: "Click the Staking tab to continue.",
        waitForTx: "stake"
      });
    }

    const pending = staking.pendingRewards ?? 0n;
    if (pending > 0n || stakedBal > 0n) { // show rewards step if they just staked
      s.push({
        id: "rewards",
        anchor: '[data-tour="stake-rewards"]',
        fallbackAnchor: '[data-tour="nav-stake"]',
        title: "Rewards",
        body: "Your rewards accrue every second. This figure is a live read of the contract's `earned()` — not an animation.",
        fallbackBody: "Click the Staking tab to view rewards."
      });
      s.push({
        id: "claim",
        anchor: '[data-tour="stake-claim"]',
        fallbackAnchor: '[data-tour="nav-stake"]',
        title: "Claim",
        body: "Claiming moves your accrued rewards to your wallet. A real transaction — you'll watch it confirm.",
        fallbackBody: "Click the Staking tab to claim.",
        waitForTx: "claim"
      });
    }

    s.push({
      id: "history",
      anchor: '[data-tour="nav-transactions"]',
      title: "History",
      body: "Every action you just took is already here, each row linking to Arbiscan. Nothing is displayed that the chain can't prove."
    });

    s.push({
      id: "finish",
      anchor: null,
      title: "You're all set.",
      body: "verified on Arbiscan", // this is replaced in Popover
      primaryAction: "done"
    });

    return s;
  }, [isConnected, staking.walletBalance, staking.allowance, staking.stakedBalance, staking.pendingRewards]);

  // Handle auto-advancing wait conditions
  useEffect(() => {
    if (!tourActive) return;
    const currentStep = steps[currentStepIndex];
    if (!currentStep || !currentStep.waitForTx) return;

    if (currentStep.waitForTx === "connect" && isConnected) {
      goNext();
    }
    // We can rely on staking.isConfirmed for the other steps, 
    // but a safer way is to check if the underlying condition is met,
    // OR if the tx just confirmed for the correct action.
    if (staking.isConfirmed) {
      if (currentStep.waitForTx === "faucet" && staking.action === "faucet") goNext();
      if (currentStep.waitForTx === "approve" && staking.action === "approve") goNext();
      if (currentStep.waitForTx === "stake" && staking.action === "stake") goNext();
      if (currentStep.waitForTx === "claim" && staking.action === "claim") goNext();
    }
  }, [tourActive, currentStepIndex, steps, isConnected, staking.isConfirmed, staking.action, goNext]);

  return (
    <TourContext.Provider
      value={{
        tourActive,
        steps,
        currentStepIndex,
        startTour,
        endTour,
        goNext,
        goPrev,
        fillAmount,
      }}
    >
      {children}
      {tourActive && (
        <>
          <TourOverlay />
          <TourPopover />
        </>
      )}
    </TourContext.Provider>
  );
}
