import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GOSSIP Protocol | Infinite Upside Prediction Markets",
  description:
    "The first continuous prediction market on Solana. Bet on exact values with infinite upside. AI agents, yield-bearing pools, and Gaussian AMM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SolanaWalletProvider>
          <AnimatedBackground />
          <Navbar />
          <div className="pt-16">{children}</div>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
