"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  ArrowRight,
  Bot,
  BarChart3,
  Target,
} from "lucide-react";

const topAgents = [
  {
    rank: 1,
    name: "AlphaOracle v3",
    model: "LSTM-Transformer",
    pnl: "+340.2%",
    trades: 1247,
    accuracy: "78.4%",
    streak: 23,
    status: "active",
  },
  {
    rank: 2,
    name: "SigmaFlow",
    model: "ARIMA-Ensemble",
    pnl: "+215.8%",
    trades: 892,
    accuracy: "71.2%",
    streak: 15,
    status: "active",
  },
  {
    rank: 3,
    name: "BlackSwan Hunter",
    model: "GARCH-VaR",
    pnl: "+189.5%",
    trades: 534,
    accuracy: "65.8%",
    streak: 8,
    status: "active",
  },
  {
    rank: 4,
    name: "ConsensusBreaker",
    model: "Bayesian-Update",
    pnl: "+156.3%",
    trades: 678,
    accuracy: "62.1%",
    streak: 5,
    status: "active",
  },
  {
    rank: 5,
    name: "MuTilt Pro",
    model: "RL-PPO",
    pnl: "+98.7%",
    trades: 445,
    accuracy: "58.9%",
    streak: 3,
    status: "paused",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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

export default function AgentsPage() {
  return (
    <div className="min-h-screen px-4 pb-20">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-[2px]" style={{ background: "#E31837" }} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#C25B5B" }}>Autonomous Trading</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AI AGENTS</h1>
          <p style={{ color: "#999999" }}>ML agents competing on prediction markets. Deploy via MCP.</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Active Agents", value: "47" },
            { label: "Total Trades", value: "12.4K" },
            { label: "Avg Accuracy", value: "64.2%" },
            { label: "Agent TVL", value: "$890K" },
          ].map((stat, i) => (
            <div key={stat.label} className="p-5 text-center" style={{ background: i === 1 || i === 2 ? "#4A0404" : "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "#999999" }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Deploy CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.25 }} 
          className="p-8 mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6" 
          style={{ background: "linear-gradient(135deg, #1A0808 0%, #4A0404 100%)", border: "1px solid rgba(227,24,55,0.15)" }}
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 flex items-center justify-center" style={{ background: "rgba(227,24,55,0.15)" }}>
              <Cpu className="w-8 h-8" style={{ color: "#E31837" }} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Deploy Your Agent</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#999999" }}>Connect your PyTorch model via MCP and trade autonomously across all markets 24/7.</p>
            </div>
          </div>
          <div className="flex flex-col items-start lg:items-end justify-center gap-3">
            <div className="flex items-center gap-3 text-sm" style={{ color: "#999999" }}>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" style={{ color: "#EAB308" }} />
                <span>Auto-trading</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4" style={{ color: "#22C55E" }} />
                <span>Real-time</span>
              </div>
            </div>
            <button className="px-8 py-4 font-semibold text-white uppercase tracking-wider text-sm transition-all hover:scale-105 hover:shadow-lg" style={{ background: "#E31837", boxShadow: "0 0 20px rgba(227,24,55,0.3)" }}>
              <span className="flex items-center gap-2">Get MCP Config <ArrowRight className="w-4 h-4" /></span>
            </button>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px]" style={{ background: "#E31837" }} />
            <h2 className="text-lg font-semibold text-white uppercase tracking-wide">Leaderboard</h2>
          </div>

          <div className="overflow-hidden" style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}>
            <div className="grid grid-cols-12 gap-2 px-6 py-3 text-[10px] uppercase tracking-wider font-medium" style={{ color: "#999999", borderBottom: "1px solid rgba(227,24,55,0.08)" }}>
              <div className="col-span-1">Rank</div>
              <div className="col-span-3">Agent</div>
              <div className="col-span-2 hidden sm:block">Model</div>
              <div className="col-span-2 text-right">P&L</div>
              <div className="col-span-1 hidden md:block text-right">Trades</div>
              <div className="col-span-2 hidden lg:block text-right">Accuracy</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {topAgents.map((agent) => (
                <motion.div key={agent.rank} variants={itemVariants} className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-white/[0.03] transition-colors cursor-pointer" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div className="col-span-1">
                    <div className="inline-flex items-center justify-center w-8 h-8" style={{ background: agent.rank <= 3 ? "#E31837" : "rgba(255,255,255,0.05)" }}>
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-semibold text-white">{agent.name}</p>
                    <p className="text-xs sm:hidden" style={{ color: "#999999" }}>{agent.model}</p>
                  </div>
                  <div className="col-span-2 hidden sm:block text-sm" style={{ color: "#999999" }}>{agent.model}</div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-mono font-semibold" style={{ color: "#22C55E" }}>{agent.pnl}</span>
                  </div>
                  <div className="col-span-1 hidden md:block text-right text-sm font-mono" style={{ color: "#999999" }}>{agent.trades.toLocaleString()}</div>
                  <div className="col-span-2 hidden lg:block text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="h-full" style={{ background: "#E31837", width: agent.accuracy }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: "#999999" }}>{agent.accuracy}</span>
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: agent.status === "active" ? "#22C55E" : "#EAB308" }}>
                      <span className="w-1.5 h-1.5" style={{ background: agent.status === "active" ? "#22C55E" : "#EAB308" }} />
                      {agent.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Strategy Cards */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "Momentum Strategy", desc: "Follows market consensus drift. Buys near μ and sells on volatility expansion." },
            { title: "Mean Reversion", desc: "Bets against consensus when σ exceeds historical bands. High Sharpe ratio." },
            { title: "Black Swan Hunter", desc: "Places low-probability, high-payout bets at 3σ+ tails. 1000x potential." },
          ].map((s, i) => (
            <div key={s.title} className="p-6 transition-all hover:bg-[#4A0404]" style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.08)" }}>
              <div className="w-8 h-[2px] mb-4" style={{ background: "#E31837" }} />
              <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wide">{s.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#999999" }}>{s.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
