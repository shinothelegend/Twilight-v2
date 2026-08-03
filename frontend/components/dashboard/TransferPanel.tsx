"use client";

import {useState} from "react";
import {isAddress, parseEther, parseUnits, type Address} from "viem";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import {TxStatus} from "@/components/ui/TxStatus";
import {Button, EmptyState, Panel} from "@/components/ui/primitives";
import {twilightToken} from "@/lib/contracts";
import {formatAmount} from "@/lib/format";
import type {useRealBalances} from "@/lib/hooks/useRealBalances";

type Balances = ReturnType<typeof useRealBalances>;
type Asset = "ETH" | "TWLT";

/**
 * Send ETH or TWLT, and show the address to receive at.
 *
 * Both paths submit real transactions: ETH through `eth_sendTransaction`, TWLT through the
 * token's `transfer`. The panel refuses to submit until the recipient is a valid address and the
 * amount fits the balance actually read from chain.
 */
export function TransferPanel({balances}: {balances: Balances}) {
  const {address, isConnected} = useAccount();
  const [tab, setTab] = useState<"send" | "receive">("send");
  const [asset, setAsset] = useState<Asset>("ETH");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const sendNative = useSendTransaction();
  const sendToken = useWriteContract();
  const hash = asset === "ETH" ? sendNative.data : sendToken.data;
  const receipt = useWaitForTransactionReceipt({hash});

  const isSigning = sendNative.isPending || sendToken.isPending;
  const error = (sendNative.error ?? sendToken.error ?? receipt.error) as Error | null;

  const available = asset === "ETH" ? balances.nativeBalance : balances.tokenBalance;

  const recipientValid = recipient !== "" && isAddress(recipient);
  let amountError: string | null = null;
  if (amount !== "") {
    try {
      const parsed = asset === "ETH" ? parseEther(amount) : parseUnits(amount, 18);
      if (parsed <= 0n) amountError = "Enter an amount greater than zero.";
      else if (available !== undefined && parsed > available) amountError = "More than your balance.";
    } catch {
      amountError = "Not a valid amount.";
    }
  }

  const busy = isSigning || receipt.isLoading;
  const canSend = recipientValid && amount !== "" && !amountError && !busy;

  const submit = async () => {
    try {
      if (asset === "ETH") {
        await sendNative.sendTransactionAsync({
          to: recipient as Address,
          value: parseEther(amount),
        });
      } else {
        await sendToken.writeContractAsync({
          ...twilightToken,
          functionName: "transfer",
          args: [recipient as Address, parseUnits(amount, 18)],
        });
      }
      setAmount("");
      setRecipient("");
      balances.refetch();
    } catch {
      // Rejected in the wallet or reverted; surfaced by TxStatus.
    }
  };

  const copy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Panel
      title="Send & receive"
      subtitle="Real transfers on Arbitrum Sepolia"
      action={
        <div className="flex gap-1 rounded-lg border border-edge p-0.5">
          {(["send", "receive"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={
                "rounded-md px-3 py-1 text-[11px] tracking-[0.14em] uppercase transition-colors " +
                (tab === value ? "bg-panel-raised text-ink" : "text-faint hover:text-muted")
              }
            >
              {value}
            </button>
          ))}
        </div>
      }
    >
      {!isConnected ? (
        <EmptyState title="Connect a wallet to send or receive" />
      ) : tab === "receive" ? (
        <div className="px-5 py-6">
          <p className="text-[11px] tracking-[0.16em] text-faint uppercase">Your address</p>
          <p className="tnum mt-3 text-sm leading-relaxed break-all text-ink">{address}</p>
          <Button variant="ghost" className="mt-4 w-full" onClick={() => void copy()}>
            {copied ? "Copied" : "Copy address"}
          </Button>
          <p className="mt-3 text-xs leading-relaxed text-faint">
            Accepts ETH and any ERC-20 on Arbitrum Sepolia. Incoming TWLT transfers appear in
            Recent transactions once the block is mined.
          </p>
        </div>
      ) : (
        <div className="px-5 py-5">
          <div className="mb-4 flex gap-1 rounded-xl border border-edge p-1">
            {(["ETH", "TWLT"] as const).map((value) => (
              <button
                key={value}
                onClick={() => {
                  setAsset(value);
                  setAmount("");
                }}
                className={
                  "flex-1 rounded-lg py-2 text-xs tracking-[0.14em] uppercase transition-colors " +
                  (asset === value ? "bg-panel-raised text-ink" : "text-faint hover:text-muted")
                }
              >
                {value}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="sr-only">Recipient address</span>
            <input
              value={recipient}
              onChange={(event) => setRecipient(event.target.value.trim())}
              placeholder="0x…"
              spellCheck={false}
              className="tnum w-full rounded-xl border border-edge bg-night-800 px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-muted"
            />
          </label>
          {recipient !== "" && !recipientValid && (
            <p className="mt-2 text-xs text-muted">That is not a valid address.</p>
          )}

          <label className="mt-3 block">
            <span className="sr-only">Amount</span>
            <div className="flex items-center gap-2 rounded-xl border border-edge bg-night-800 px-4 py-3 focus-within:border-muted">
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                placeholder="0.0"
                className="tnum min-w-0 flex-1 bg-transparent text-lg text-ink outline-none placeholder:text-faint"
              />
              <span className="text-xs text-faint">{asset}</span>
            </div>
          </label>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-faint">
              Available: <span className="tnum">{formatAmount(available, 18, 5)}</span> {asset}
            </span>
            {amountError && <span className="text-muted">{amountError}</span>}
          </div>

          <Button className="mt-4 w-full" disabled={!canSend} onClick={() => void submit()}>
            {busy
              ? isSigning
                ? "Confirm in wallet…"
                : "Pending…"
              : `Send ${asset}`}
          </Button>
        </div>
      )}

      <TxStatus
        hash={hash}
        isSigning={isSigning}
        isConfirming={receipt.isLoading}
        isConfirmed={receipt.isSuccess}
        error={error}
        onDismiss={() => {
          sendNative.reset();
          sendToken.reset();
        }}
      />
    </Panel>
  );
}
