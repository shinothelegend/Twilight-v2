"use client";

import "@rainbow-me/rainbowkit/styles.css";

import {RainbowKitProvider, darkTheme} from "@rainbow-me/rainbowkit";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useState} from "react";
import {WagmiProvider} from "wagmi";

import {arbitrumSepolia, wagmiConfig} from "@/lib/wagmiConfig";

/**
 * RainbowKit's default theme is deliberately colourful; Twilight is strictly grayscale, so the
 * wallet modal is re-themed to the same palette as the rest of the app.
 */
const twilightWalletTheme = darkTheme({
  accentColor: "#eeeeef",
  accentColorForeground: "#0a0a0c",
  borderRadius: "medium",
  overlayBlur: "small",
});

twilightWalletTheme.colors.modalBackground = "#141418";
twilightWalletTheme.colors.modalBorder = "#2c2c32";
twilightWalletTheme.colors.modalText = "#eeeeef";
twilightWalletTheme.colors.modalTextSecondary = "#8a8a90";
twilightWalletTheme.colors.actionButtonBorder = "#2c2c32";
twilightWalletTheme.colors.closeButtonBackground = "#1c1c20";
twilightWalletTheme.colors.generalBorder = "#2a2a2f";
twilightWalletTheme.colors.profileForeground = "#1c1c20";

import {ThemeProvider} from "next-themes";

export function Providers({children}: {children: React.ReactNode}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={twilightWalletTheme}
            initialChain={arbitrumSepolia}
            modalSize="compact"
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
