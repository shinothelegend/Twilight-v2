"use client";

import {connectorsForWallets} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  rabbyWallet,
  trustWallet,
  okxWallet,
  phantomWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {createConfig, fallback, http} from "wagmi";
import {arbitrumSepolia} from "wagmi/chains";

/**
 * WalletConnect project id. Without it the app still connects through any injected
 * wallet (MetaMask, Rabby, Brave) and Coinbase Wallet.
 */
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "twilight-defi-local";

const wallets = [
  metaMaskWallet,
  rabbyWallet,
  trustWallet,
  okxWallet,
  phantomWallet,
  coinbaseWallet,
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
];

const connectors = connectorsForWallets([{groupName: "Connect", wallets}], {
  appName: "Twilight DeFi",
  // RainbowKit requires a non-empty string here; the WalletConnect wallets are only registered
  // above when a real id is present, so this placeholder is never used to open a session.
  projectId: projectId || "twilight-defi-local",
});

/**
 * Primary RPC comes from the env var when set (Alchemy/Infura free tier is noticeably more
 * reliable for `eth_getLogs`), falling back to the two public Arbitrum Sepolia endpoints.
 */
const rpcUrl = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL;

const transport = fallback(
  [
    ...(rpcUrl ? [http(rpcUrl)] : []),
    http("https://sepolia-rollup.arbitrum.io/rpc"),
    http("https://arbitrum-sepolia.drpc.org"),
  ],
  {rank: false},
);

export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  connectors,
  transports: {[arbitrumSepolia.id]: transport},
  ssr: true,
});

export {arbitrumSepolia};

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
