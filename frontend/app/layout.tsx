import type {Metadata, Viewport} from "next";
import {Inter, Playfair_Display, Space_Grotesk} from "next/font/google";

import {Providers} from "@/app/providers";

import "./globals.css";

// Display serif for the headline and the balance figure — the cinematic register. Everything
// else stays in the grotesque/sans pair so the numbers remain plain and legible.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-playfair",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Twilight DeFi",
  description:
    "A calm, legible wallet dashboard for Arbitrum. Send, receive, stake and track real on-chain assets.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${spaceGrotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-night-900 text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
