"use client";

import {useEffect, useState} from "react";
import {useAccount} from "wagmi";

import {TxStatus} from "@/components/ui/TxStatus";
import {Button, Panel} from "@/components/ui/primitives";
import {explorer, twilightToken} from "@/lib/contracts";
import {formatDuration} from "@/lib/format";
import {useStaking} from "@/lib/hooks/useStaking";

/**
 * Public faucet, so anyone (judges included) can get TWLT without being funded by hand.
 *
 * The cooldown shown is the contract's own `nextFaucetClaim` value for the connected address,
 * counted against the current time — not a client-side timer.
 */
export function FaucetCard({noPanel = false}: {noPanel?: boolean}) {
  const {isConnected} = useAccount();
  const staking = useStaking();

  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const interval = setInterval(() => setNowSeconds(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);
  const nextClaim = staking.nextFaucetClaim === undefined ? undefined : Number(staking.nextFaucetClaim);
  const secondsLeft = nextClaim === undefined ? undefined : nextClaim - nowSeconds;
  const onCooldown = secondsLeft !== undefined && secondsLeft > 0;
  const busy = staking.isSigning || staking.isConfirming;

  const innerContent = (
    <div className="px-5 py-5 flex flex-col">
      <p className="text-xs leading-relaxed text-muted">
        TWLT is minted by the{" "}
        <a
          href={explorer.address(twilightToken.address)}
          target="_blank"
          rel="noreferrer"
          className="text-neutral-strong underline decoration-edge underline-offset-4 transition-colors hover:decoration-muted"
        >
          token contract
        </a>{" "}
        itself. The cooldown is enforced on chain, per address.
      </p>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-faint font-bold">
        Read from TwilightToken.nextFaucetClaim()
      </p>

      <Button
        className="mt-4 w-full"
        disabled={!isConnected || busy || onCooldown}
        onClick={() => void staking.claimFaucet().catch(() => undefined)}
        data-tour="faucet-claim"
      >
        {!isConnected
          ? "Connect wallet"
          : busy && staking.action === "faucet"
            ? staking.isSigning
              ? "Confirm in wallet…"
              : "Pending…"
            : onCooldown
              ? `Available in ${formatDuration(secondsLeft!)}`
              : "Claim 100 TWLT"}
      </Button>

      <TxStatus
        hash={staking.action === "faucet" || staking.isConfirmed ? staking.hash : undefined}
        isSigning={staking.isSigning && staking.action === "faucet"}
        isConfirming={staking.isConfirming && staking.action === "faucet"}
        isConfirmed={staking.isConfirmed}
        error={staking.error}
        onDismiss={staking.resetTx}
      />
    </div>
  );

  if (noPanel) {
    return innerContent;
  }

  return (
    <Panel title="Faucet" subtitle="100 TWLT per address, once every 24 hours">
      {innerContent}
    </Panel>
  );
}
