"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Activity,
  Clock,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";

const markets = [
  {
    id: "sol-price",
    title: "Will SOL hit $250 by Friday?",
    category: "Crypto",
    mu: 198.42,
    sigma: 24.5,
    liquidity: 124500,
    volume: 890000,
    status: "live",
    endsIn: "2d 14h",
    color: "from-purple-500/20 to-cyan-500/20",
  },
  {
    id: "btc-etf",
    title: "BTC ETF Inflows Next Week ($M)",
    category: "Finance",
    mu: 450.0,
    sigma: 120.0,
    liquidity: 67800,
    volume: 420000,
    status: "live",
    endsIn: "5d 8h",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "nyc-temp",
    title: "NYC Temperature on Dec 31 (°F)",
    category: "Weather",
    mu: 38.5,
    sigma: 8.2,
    liquidity: 34500,
    volume: 156000,
    status: "live",
    endsIn: "28d 12h",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "fed-rate",
    title: "Fed Funds Rate Decision (%)",
    category: "Macro",
    mu: 4.25,
    sigma: 0.35,
    liquidity: 234000,
    volume: 1200000,
    status: "live",
    endsIn: "12d 6h",
    color: "from-rose-500/20 to-pink-500/20",
  },
  {
    id: "eth-gas",
    title: "ETH Average Gas Price (gwei)",
    category: "Crypto",
    mu: 28.4,
    sigma: 12.1,
    liquidity: 18900,
    volume: 78000,
    status: "live",
    endsIn: "1d 22h",
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "ai-benchmark",
    title: "GPT-5 MMLU Score (%)",
    category: "AI",
    mu: 89.2,
    sigma: 3.5,
    liquidity: 56700,
    volume: 210000,
    status: "upcoming",
    endsIn: "45d",
    color: "from-cyan-500/20 to-blue-500/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 22 },
  },
};

export default function MarketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Crypto", "Finance", "Weather", "Macro", "AI"];

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      const matchesSearch = market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || market.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen px-4 pb-20">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Featured Market Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="relative overflow-hidden p-8" style={{ background: "linear-gradient(135deg, #4A0404 0%, #1A0808 100%)", border: "1px solid rgba(227,24,55,0.3)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{ background: "radial-gradient(circle, #E31837 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 animate-pulse" style={{ background: "#22C55E" }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#22C55E" }}>FEATURED</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">MARKETS</h1>
              <p style={{ color: "#999999" }}>Continuous prediction markets with infinite upside</p>
              <div className="flex items-center gap-6 mt-6 pt-6" style={{ borderTop: "1px solid rgba(227,24,55,0.15)" }}>
                <div>
                  <p className="text-2xl font-bold text-white">$2.4M</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "#999999" }}>Total Volume</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">18</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "#999999" }}>Active Markets</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">47</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "#999999" }}>AI Agents</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#999999" }} />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none transition-all"
              style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.12)" }}
            />
          </div>
          <div className="flex gap-2">
            {categories.map((cat, i) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
                style={{
                  background: selectedCategory === cat ? "#E31837" : "transparent",
                  color: "#FFFFFF",
                  border: selectedCategory === cat ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Market Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {filteredMarkets.map((market, i) => (
            <motion.div key={market.id} variants={itemVariants}>
              <Link href={`/market/${market.id}`}>
                <div
                  className="group cursor-pointer transition-all hover:border-[rgba(227,24,55,0.4)] hover:scale-[1.01] h-full flex flex-col p-6"
                  style={{
                    background: i % 3 === 1 ? "#4A0404" : "#1A0808",
                    border: "1px solid rgba(227,24,55,0.1)",
                  }}
                >
                  {/* Top Row */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[10px] font-bold px-2 py-1 uppercase tracking-wider"
                      style={{
                        background: market.status === "live" ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)",
                        color: market.status === "live" ? "#22C55E" : "#EAB308",
                      }}
                    >
                      {market.status === "live" ? "LIVE" : "UPCOMING"}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: "#999999" }}>
                      <Clock className="w-3 h-3" /> {market.endsIn}
                    </span>
                  </div>

                  {/* Category */}
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: "#E31837" }}>
                    {market.category}
                  </p>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-white mb-4 group-hover:text-[#E31837] transition-colors leading-snug">
                    {market.title}
                  </h3>

                  {/* Mini Bell Curve — Red tones */}
                  <div className="flex-1 mb-4 relative h-14 overflow-hidden" style={{ background: "rgba(227,24,55,0.03)", border: "1px solid rgba(227,24,55,0.06)" }}>
                    <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
                      <path
                        d={(() => { const mu=100; const sigma=35; let d="M 0 60"; for(let x=0;x<=200;x+=2){ const y=55-45*Math.exp(-0.5*Math.pow((x-mu)/sigma,2)); d+=` L ${x} ${y}`; } d+=" L 200 60 Z"; return d; })()}
                        fill="url(#redBell)"
                        stroke="#E31837"
                        strokeWidth="1.2"
                        opacity="0.7"
                      />
                      <defs>
                        <linearGradient id="redBell" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#E31837" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#E31837" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#999999" }}>Consensus</p>
                      <p className="text-sm font-mono font-semibold text-white">
                        {market.category === "Weather" ? `${market.mu}°F` : market.category === "Macro" ? `${market.mu}%` : `$${market.mu.toLocaleString()}`}
                      </p>
                    </div>
                    <div className="p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#999999" }}>Liquidity</p>
                      <p className="text-sm font-mono font-semibold text-white">{market.liquidity.toLocaleString()} CASH</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "#999999" }}>
                      <TrendingUp className="w-3 h-3" />
                      <span>${(market.volume / 1000).toFixed(0)}K vol</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: "#E31837" }}>
                      Trade <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
