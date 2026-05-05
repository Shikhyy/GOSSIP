"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Award,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import { useUserPositions } from "@/hooks";

const positions = [
  {
    market: "Will SOL hit $250 by Friday?",
    prediction: 245.0,
    stake: 50,
    currentPnl: "+12.4%",
    status: "active",
    entered: "2 days ago",
    mu: 198.42,
  },
  {
    market: "BTC ETF Inflows Next Week ($M)",
    prediction: 520.0,
    stake: 25,
    currentPnl: "-3.2%",
    status: "active",
    entered: "5 days ago",
    mu: 450.0,
  },
  {
    market: "NYC Temperature on Dec 31 (°F)",
    prediction: 35.0,
    stake: 10,
    currentPnl: "+8.7%",
    status: "active",
    entered: "1 week ago",
    mu: 38.5,
  },
  {
    market: "Fed Funds Rate Decision (%)",
    prediction: 4.5,
    stake: 100,
    currentPnl: "+1.1%",
    status: "active",
    entered: "3 days ago",
    mu: 4.25,
  },
];

const history = [
  {
    market: "ETH Average Gas Price (gwei)",
    prediction: 35.0,
    actual: 28.4,
    stake: 20,
    payout: 0,
    result: "loss",
    date: "May 1, 2026",
  },
  {
    market: "SOL Price March Close ($)",
    prediction: 185.0,
    actual: 192.5,
    stake: 30,
    payout: 145.5,
    result: "win",
    date: "Apr 1, 2026",
  },
  {
    market: "AI Benchmark Score",
    prediction: 92.0,
    actual: 89.2,
    stake: 15,
    payout: 0,
    result: "loss",
    date: "Mar 15, 2026",
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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

export default function PortfolioPage() {
  const { positions: userPositions, isLoading } = useUserPositions();

  const positions = userPositions.length > 0 ? userPositions : [
    {
      market: "Will SOL hit $250 by Friday?",
      prediction: 245.0,
      stake: 50,
      currentPnl: "+12.4%",
      status: "active",
      entered: "2 days ago",
      mu: 198.42,
    },
    {
      market: "BTC ETF Inflows Next Week ($M)",
      prediction: 520.0,
      stake: 25,
      currentPnl: "-3.2%",
      status: "active",
      entered: "5 days ago",
      mu: 450.0,
    },
    {
      market: "NYC Temperature on Dec 31 (°F)",
      prediction: 35.0,
      stake: 10,
      currentPnl: "+8.7%",
      status: "active",
      entered: "1 week ago",
      mu: 38.5,
    },
    {
      market: "Fed Funds Rate Decision (%)",
      prediction: 4.5,
      stake: 100,
      currentPnl: "+1.1%",
      status: "active",
      entered: "3 days ago",
      mu: 4.25,
    },
  ];

  const calculatePnL = (pos: typeof positions[0]) => {
    const currentValue = pos.mu > pos.prediction 
      ? pos.stake * (1 + (pos.mu - pos.prediction) / pos.mu)
      : pos.stake * (1 - (pos.prediction - pos.mu) / pos.mu);
    const pnl = ((currentValue - pos.stake) / pos.stake) * 100;
    return pnl;
  };

  const totalPnL = positions.reduce((acc, pos) => acc + calculatePnL(pos), 0);
  const avgPnL = totalPnL / positions.length;

  return (
    <div className="min-h-screen px-4 pb-20">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-[2px]" style={{ background: "#E31837" }} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#C25B5B" }}>Your Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">PORTFOLIO</h1>
          <p style={{ color: "#999999" }}>Track active positions, P&L, and trading history</p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Total Value", value: "$4,247.80" },
            { label: "Unrealized P&L", value: "+$312.50", accent: true },
            { label: "Active Positions", value: "4", accent: true },
            { label: "Win Rate", value: "62.5%" },
          ].map((stat, i) => (
            <div key={stat.label} className="p-5" style={{ background: stat.accent ? "#4A0404" : "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "#999999" }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Active Positions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px]" style={{ background: "#E31837" }} />
            <h2 className="text-lg font-semibold text-white uppercase tracking-wide">Active Positions</h2>
          </div>

          <div className="overflow-hidden" style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}>
            <div className="grid grid-cols-12 gap-2 px-6 py-3 text-[10px] uppercase tracking-wider font-medium" style={{ color: "#999999", borderBottom: "1px solid rgba(227,24,55,0.08)" }}>
              <div className="col-span-4 sm:col-span-3">Market</div>
              <div className="col-span-2 text-right">Prediction</div>
              <div className="col-span-2 hidden sm:block text-right">Stake</div>
              <div className="col-span-3 sm:col-span-2 text-right">P&L</div>
              <div className="col-span-3 sm:col-span-2 text-right">Time</div>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {positions.map((pos, i) => (
                <motion.div key={i} variants={itemVariants} className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div className="col-span-4 sm:col-span-3">
                    <p className="text-sm font-medium text-white truncate">{pos.market}</p>
                    <p className="text-xs" style={{ color: "#999999" }}>μ = {pos.mu}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-mono font-semibold text-white">${pos.prediction}</span>
                  </div>
                  <div className="col-span-2 hidden sm:block text-right text-sm font-mono" style={{ color: "#999999" }}>{pos.stake} CASH</div>
                  <div className="col-span-3 sm:col-span-2 text-right">
                    <span className="inline-flex items-center gap-1 text-sm font-mono font-semibold" style={{ color: pos.currentPnl.startsWith("+") ? "#22C55E" : "#E31837" }}>
                      {pos.currentPnl.startsWith("+") ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {pos.currentPnl}
                    </span>
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-right">
                    <span className="text-xs flex items-center justify-end gap-1" style={{ color: "#999999" }}>
                      <Clock className="w-3 h-3" /> {pos.entered}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px]" style={{ background: "#E31837" }} />
            <h2 className="text-lg font-semibold text-white uppercase tracking-wide">Closed Positions</h2>
          </div>

          <div className="overflow-hidden" style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}>
            <div className="grid grid-cols-12 gap-2 px-6 py-3 text-[10px] uppercase tracking-wider font-medium" style={{ color: "#999999", borderBottom: "1px solid rgba(227,24,55,0.08)" }}>
              <div className="col-span-4 sm:col-span-3">Market</div>
              <div className="col-span-2 text-right">Predicted</div>
              <div className="col-span-2 hidden sm:block text-right">Actual</div>
              <div className="col-span-2 sm:col-span-1 text-right">Stake</div>
              <div className="col-span-2 text-right">Result</div>
              <div className="col-span-2 hidden md:block text-right">Date</div>
            </div>

            {history.map((h, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div className="col-span-4 sm:col-span-3">
                  <p className="text-sm font-medium text-white truncate">{h.market}</p>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-mono text-white">{h.prediction}</span>
                </div>
                <div className="col-span-2 hidden sm:block text-right">
                  <span className="text-sm font-mono" style={{ color: "#999999" }}>{h.actual}</span>
                </div>
                <div className="col-span-2 sm:col-span-1 text-right text-sm font-mono" style={{ color: "#999999" }}>{h.stake}</div>
                <div className="col-span-2 text-right">
                  {h.result === "win" ? (
                    <span className="inline-flex items-center gap-1 text-sm font-mono font-semibold" style={{ color: "#22C55E" }}>
                      <ArrowUpRight className="w-3.5 h-3.5" /> +{h.payout}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm font-mono font-semibold" style={{ color: "#E31837" }}>
                      <TrendingDown className="w-3.5 h-3.5" /> -{h.stake}
                    </span>
                  )}
                </div>
                <div className="col-span-2 hidden md:block text-right text-xs" style={{ color: "#999999" }}>{h.date}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
