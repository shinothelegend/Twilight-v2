"use client";
import {createContext, useContext} from "react";

export type TourStep = {
  id: string;
  anchor: string | null;
  fallbackAnchor?: string | null;
  title: string;
  body: React.ReactNode;
  fallbackBody?: React.ReactNode;
  waitForTx?: "connect" | "faucet" | "approve" | "stake" | "claim";
  primaryAction?: "start" | "next" | "done";
  route?: string;
};

export const TourContext = createContext<{
  tourActive: boolean;
  steps: TourStep[];
  currentStepIndex: number;
  startTour: () => void;
  endTour: () => void;
  goNext: () => void;
  goPrev: () => void;
  fillAmount: (amount: string) => void;
} | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("Missing TourProvider");
  return ctx;
}
