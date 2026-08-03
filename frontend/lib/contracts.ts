import type {Address} from "viem";

import {
  deployment,
  twilightStakingAbi,
  twilightStakingAddress,
  twilightTokenAbi,
  twilightTokenAddress,
} from "@/lib/generated/contracts";

export {twilightStakingAbi, twilightTokenAbi, deployment};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export const twilightToken = {
  address: twilightTokenAddress as Address,
  abi: twilightTokenAbi,
} as const;

export const twilightStaking = {
  address: twilightStakingAddress as Address,
  abi: twilightStakingAbi,
} as const;

/**
 * False until the Foundry deploy script has actually run against Arbitrum Sepolia.
 *
 * The UI uses this to show an explicit "contracts not deployed" state. It never substitutes
 * placeholder balances or activity — an unconfigured app says so plainly.
 */
export const contractsDeployed =
  twilightToken.address !== ZERO_ADDRESS && twilightStaking.address !== ZERO_ADDRESS;

/** Block the contracts were created in; all event queries start here rather than at genesis. */
export const startBlock = deployment.startBlock;

export const explorer = {
  tx: (hash: string) => `${deployment.explorer}/tx/${hash}`,
  address: (address: string) => `${deployment.explorer}/address/${address}`,
  token: (address: string) => `${deployment.explorer}/token/${address}`,
};
