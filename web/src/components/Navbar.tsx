"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { BarChart3, Bot, ChevronRight, Menu, PlusCircle, Wallet2, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/markets", label: "Markets" },
  { href: "/agents", label: "Agents" },
  { href: "/portfolio", label: "Portfolio" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/6 bg-[#07101cb8] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#4da3ff]/20 bg-[#0d1a2b] shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
              <BarChart3 className="h-4.5 w-4.5 text-[#4da3ff]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">GOSSIP Markets</p>
              <p className="text-[11px] text-[#8fa4c2]">Continuous prediction trading</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-white/7 text-white" : "text-[#9cb0ca] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/agents/deploy"
            className="trading-button trading-button-secondary px-3 py-2"
          >
            <Bot className="h-4 w-4" />
            Deploy Agent
          </Link>
          <Link
            href="/markets/create"
            className="trading-button trading-button-primary px-3 py-2"
          >
            <PlusCircle className="h-4 w-4" />
            New Market
          </Link>
          <div className="wallet-adapter-sharp">
            <WalletMultiButton
              style={{
                height: "40px",
                borderRadius: "14px",
                background: "rgba(13,26,43,0.92)",
                border: "1px solid rgba(124,151,185,0.2)",
                color: "#eef4ff",
                boxShadow: "none",
                padding: "0 14px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            />
          </div>
        </div>

        <button
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/6 bg-[#07101cf0] md:hidden"
          >
            <div className="space-y-2 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-[#8fa4c2]" />
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/agents/deploy" className="trading-button trading-button-secondary px-3 py-3 text-center">
                  <Bot className="h-4 w-4" />
                  Agent
                </Link>
                <Link href="/markets/create" className="trading-button trading-button-primary px-3 py-3 text-center">
                  <PlusCircle className="h-4 w-4" />
                  Market
                </Link>
              </div>
              <div className="pt-2">
                <WalletMultiButton
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    height: "42px",
                    borderRadius: "14px",
                    background: "rgba(13,26,43,0.92)",
                    border: "1px solid rgba(124,151,185,0.2)",
                    color: "#eef4ff",
                    boxShadow: "none",
                    padding: "0 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-[#0b1727] px-3 py-3 text-xs text-[#8fa4c2]">
                <Wallet2 className="h-4 w-4 text-[#4da3ff]" />
                Devnet wallet, live UI, demo liquidity fallback.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
