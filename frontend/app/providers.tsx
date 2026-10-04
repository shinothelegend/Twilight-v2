"use client";

import "@rainbow-me/rainbowkit/styles.css";

import {RainbowKitProvider, darkTheme, lightTheme} from "@rainbow-me/rainbowkit";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useState, useEffect} from "react";
import {WagmiProvider} from "wagmi";
import {useTheme, ThemeProvider} from "next-themes";
import {arbitrumSepolia, wagmiConfig} from "@/lib/wagmiConfig";
import {ThemeTransition} from "@/components/ui/ThemeTransition";

const twilightDarkTheme = darkTheme({
  accentColor: "#eeeeef",
  accentColorForeground: "#0a0a0c",
  borderRadius: "medium",
  overlayBlur: "small",
});
twilightDarkTheme.colors.modalBackground = "#141418";
twilightDarkTheme.colors.modalBorder = "#2c2c32";
twilightDarkTheme.colors.modalText = "#eeeeef";
twilightDarkTheme.colors.modalTextSecondary = "#8a8a90";
twilightDarkTheme.colors.actionButtonBorder = "#2c2c32";
twilightDarkTheme.colors.closeButtonBackground = "#1c1c20";
twilightDarkTheme.colors.generalBorder = "#2a2a2f";
twilightDarkTheme.colors.profileForeground = "#1c1c20";

const twilightLightTheme = lightTheme({
  accentColor: "#111111",
  accentColorForeground: "#ffffff",
  borderRadius: "medium",
  overlayBlur: "small",
});
twilightLightTheme.colors.modalBackground = "#ffffff";
twilightLightTheme.colors.modalBorder = "#e5e7eb";
twilightLightTheme.colors.modalText = "#111111";
twilightLightTheme.colors.modalTextSecondary = "#6b7280";
twilightLightTheme.colors.actionButtonBorder = "#e5e7eb";
twilightLightTheme.colors.closeButtonBackground = "#f3f4f6";
twilightLightTheme.colors.generalBorder = "#e5e7eb";
twilightLightTheme.colors.profileForeground = "#f3f4f6";

function InnerProviders({children}: {children: React.ReactNode}) {
  const {resolvedTheme} = useTheme();
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => setMounted(true), []);

  const activeTheme = mounted && resolvedTheme === "dark" ? twilightDarkTheme : twilightLightTheme;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={activeTheme}
          initialChain={arbitrumSepolia}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

import {TourProvider} from "@/components/tour/TourProvider";

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
      <ThemeTransition />
      <InnerProviders>
        <TourProvider>
          {children}
        </TourProvider>
      </InnerProviders>
    </ThemeProvider>
  );
}
