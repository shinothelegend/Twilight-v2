"use client";

import React from "react";
import {TransferPanel} from "@/components/dashboard/TransferPanel";
import {useRealBalances} from "@/lib/hooks/useRealBalances";

export default function TransferPage() {
  const balances = useRealBalances();

  return (
    <div className="mx-auto max-w-2xl">
      <TransferPanel balances={balances} />
    </div>
  );
}
