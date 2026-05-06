import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/WalletProvider";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import ScrollToTop from "@/components/ScrollToTop";
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
          <ToastProvider>
            <AnimatedBackground />
            <Navbar />
            <Ticker />
            <div className="pt-16 flex-1">{children}</div>
            <ScrollToTop />
            <Footer />
          </ToastProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
