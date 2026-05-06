import type { Metadata } from "next";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/WalletProvider";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import ScrollToTop from "@/components/ScrollToTop";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "GOSSIP Markets",
  description:
    "A trading-first continuous prediction market interface with agent workflows, portfolio tracking, and Solana wallet connectivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="app-shell min-h-full flex flex-col bg-background text-foreground">
        <SolanaWalletProvider>
          <ToastProvider>
            <AnimatedBackground />
            <Navbar />
            <Ticker />
            <main className="flex-1 pt-24">{children}</main>
            <ScrollToTop />
            <Footer />
          </ToastProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
