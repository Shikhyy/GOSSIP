"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Menu, X, Home, TrendingUp, Bot, Wallet } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/markets", label: "Markets" },
  { href: "/agents", label: "Agents" },
  { href: "/portfolio", label: "Portfolio" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "rgba(13, 2, 2, 0.85)", backdropFilter: "blur(12px)", borderTop: "3px solid #E31837", borderBottom: "1px solid rgba(227, 24, 55, 0.08)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 relative flex items-center justify-center" style={{ background: "#E31837" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="6" cy="6" r="2.5" fill="white"/>
                <circle cx="18" cy="6" r="2.5" fill="white"/>
                <circle cx="6" cy="18" r="2.5" fill="white"/>
                <circle cx="18" cy="18" r="2.5" fill="white"/>
                <path d="M6 6h10M6 6v10h10v-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 11l5 5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              GOSSIP
            </span>
            <div className="flex items-center gap-1.5 ml-1">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
              <span className="text-[9px] font-medium uppercase tracking-wider hidden sm:block" style={{ color: "#22C55E" }}>LIVE</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors ${
                    isActive ? "text-white" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-red"
                      className="absolute bottom-0 left-2 right-2 h-[2px]"
                      style={{ background: "#E31837" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Wallet + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="wallet-adapter-sharp hidden sm:block">
              <WalletMultiButton
                style={{
                  background: "#E31837",
                  border: "none",
                  borderRadius: "0px",
                  height: "32px",
                  padding: "0 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#fff",
                  lineHeight: "30px",
                  letterSpacing: "0.05em",
                }}
              />
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: "rgba(13, 2, 2, 0.95)", borderTop: "1px solid rgba(227, 24, 55, 0.1)" }}
          >
            <div className="px-4 py-3 space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                    {isActive && <div className="mt-1 w-6 h-[2px]" style={{ background: "#E31837" }} />}
                  </Link>
                );
              })}
              <div className="pt-2 sm:hidden">
                <WalletMultiButton
                  style={{
                    background: "#E31837",
                    border: "none",
                    borderRadius: "0px",
                    height: "40px",
                    padding: "0 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#fff",
                    width: "100%",
                    justifyContent: "center",
                    letterSpacing: "0.05em",
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
