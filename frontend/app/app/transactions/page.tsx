"use client";

import React from "react";
import {TransactionList} from "@/components/dashboard/TransactionList";
import {useRealBalances} from "@/lib/hooks/useRealBalances";
import {useRealTransactions} from "@/lib/hooks/useRealTransactions";

export default function TransactionsPage() {
  const balances = useRealBalances();
  const transactions = useRealTransactions(
    balances.tokenSymbol,
    balances.tokenDecimals,
    balances.nativeSymbol,
  );

  return (
    <div className="mx-auto max-w-2xl">
      <TransactionList
        activity={transactions.activity}
        isLoading={transactions.isLoading}
        error={transactions.error}
        refetch={() => void transactions.refetch()}
        includesNativeTransfers={transactions.includesNativeTransfers}
        isConnected={balances.isConnected}
      />
    </div>
  );
}
