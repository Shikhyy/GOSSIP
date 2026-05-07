"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CandlestickChart,
  CircleDollarSign,
  Clock3,
  Layers3,
  Link2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  agentLeaderboard,
  formatCompactCurrency,
  formatPercent,
  liveAgentActivity,
  markets,
} from "@/lib/demo-data";
import { useMarketsWithFallback } from "@/hooks/useMarketsWithFallback";

const featuredMarkets = markets.filter((market) => market.featured).slice(0, 2);
const watchlistMarkets = markets.slice(0, 4);

export default function Home() {
  const { markets: liveMarkets, isOnChain, loading } = useMarketsWithFallback();
  
  return (
    <div className="px-4 pb-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="surface-strong rounded-[28px] p-6 sm:p-8"
            style={{ background: 'linear-gradient(135deg, #091523 0%, rgba(17, 24, 39, 0.8) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className={`pill ${isOnChain ? 'pill-positive' : ''}`}>
                <Sparkles className="h-3.5 w-3.5" />
                {isOnChain ? 'Live on-chain data' : 'Demo environment'}
              </span>
              {isOnChain ? (
                <span className="pill" style={{ borderColor: 'rgba(59, 130, 246, 0.25)', color: '#8bf0c0', background: 'rgba(59, 130, 246, 0.08)' }}>
                  <Link2 className="h-3.5 w-3.5 text-[#3B82F6]" />
                  {liveMarkets.length} markets on-chain
                </span>
              ) : (
                <span className="pill">
                  <Bot className="h-3.5 w-3.5 text-[#4da3ff]" />
                  {agentLeaderboard.length} agents active
                </span>
              )}
            </div>

            <div className="mt-6 max-w-3xl">
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Continuous prediction markets with an execution surface that actually feels tradable.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#9cb0ca]">
                GOSSIP now behaves like a modern trading app: tighter information density, cleaner ticket flow,
                agent monitoring, and demo/live fallback paths that keep the product usable when onchain data is thin.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/markets" className="trading-button trading-button-primary px-4 py-3">
                Explore markets
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/agents" className="trading-button trading-button-secondary px-4 py-3">
                Review agent flow
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "24h volume",
                  value: formatCompactCurrency(2400000),
                  detail: formatPercent(12.1),
                  positive: true,
                },
                {
                  label: "Open liquidity",
                  value: formatCompactCurrency(561000),
                  detail: "Across 18 contracts",
                },
                {
                  label: "Resolved today",
                  value: "14",
                  detail: "Median slippage 0.7%",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="metric-label">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  <p className={`mt-2 text-sm ${item.positive ? "text-[#19c37d]" : "text-[#8fa4c2]"}`}>{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="surface rounded-[28px] p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Focus market</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{featuredMarkets[0]?.title}</h2>
              </div>
              <span className="pill pill-positive">Live</span>
            </div>

            <div className="mt-8 rounded-2xl border border-white/8 bg-[#091523] p-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="metric-label">Consensus</p>
                  <p className="text-4xl font-semibold text-white">
                    {featuredMarkets[0]?.unit}
                    {featuredMarkets[0]?.consensus}
                  </p>
                </div>
                <span className={`pill ${featuredMarkets[0]?.change24h && featuredMarkets[0].change24h >= 0 ? "pill-positive" : "pill-negative"}`}>
                  {formatPercent(featuredMarkets[0]?.change24h ?? 0)}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                  <p className="metric-label">Volatility band</p>
                  <p className="mt-2 text-lg font-semibold text-white">σ {featuredMarkets[0]?.sigma}</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                  <p className="metric-label">24h volume</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCompactCurrency(featuredMarkets[0]?.volume24h ?? 0)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-3 py-3 text-sm">
                <span className="text-[#9cb0ca]">Resolution</span>
                <span className="text-white">{featuredMarkets[0]?.resolutionLabel}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Link href={`/market/${featuredMarkets[0]?.id}`} className="trading-button trading-button-primary flex-1 px-4 py-3">
                Open market
              </Link>
              <Link href="/markets/create" className="trading-button trading-button-secondary px-4 py-3">
                Create
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="surface rounded-[28px] p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Watchlist</p>
                <h2 className="section-title mt-2">Active contracts</h2>
              </div>
              <Link href="/markets" className="text-sm text-[#4da3ff] hover:text-white">
                View all
              </Link>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/8">
              <div className="grid grid-cols-[2.2fr_repeat(4,1fr)] gap-3 bg-white/4 px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-[#8fa4c2]">
                <span>Market</span>
                <span className="text-right">Consensus</span>
                <span className="text-right">24h</span>
                <span className="text-right">Liquidity</span>
                <span className="text-right">Resolution</span>
              </div>
              {watchlistMarkets.map((market) => (
                <Link
                  key={market.id}
                  href={`/market/${market.id}`}
                  className="table-row grid grid-cols-[2.2fr_repeat(4,1fr)] gap-3 px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{market.title}</p>
                    <p className="mt-1 text-xs text-[#8fa4c2]">{market.subtitle}</p>
                  </div>
                  <div className="text-right text-sm font-medium text-white">
                    {market.unit}
                    {market.consensus}
                  </div>
                  <div className={`text-right text-sm font-medium ${market.change24h >= 0 ? "text-[#19c37d]" : "text-[#ff5f6d]"}`}>
                    {formatPercent(market.change24h)}
                  </div>
                  <div className="text-right text-sm text-white">{formatCompactCurrency(market.liquidity)}</div>
                  <div className="text-right text-sm text-[#9cb0ca]">{market.resolutionLabel}</div>
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="space-y-6"
          >
            <div className="surface rounded-[28px] p-6">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[#4da3ff]" />
                <p className="section-kicker">Agent feed</p>
              </div>
              <div className="mt-4 space-y-3">
                {liveAgentActivity.map((item) => (
                  <div key={`${item.agent}-${item.timestamp}`} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{item.agent}</p>
                      <span className="text-xs text-[#8fa4c2]">{item.timestamp}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#d7e5fa]">{item.action}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-[#8fa4c2]">{item.market}</span>
                      <span className="text-[#19c37d]">{item.confidence}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface rounded-[28px] p-6">
              <p className="section-kicker">Capabilities</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: CandlestickChart,
                    title: "Trading ticket",
                    description: "Wallet-aware order flow, live consensus, and tail-aware payout previews.",
                  },
                  {
                    icon: Bot,
                    title: "Agent deployment",
                    description: "Interactive deploy flow for model configs, budget envelopes, and MCP payloads.",
                  },
                  {
                    icon: CircleDollarSign,
                    title: "Portfolio tracking",
                    description: "Open positions, history, and deterministic P&L views across demo/live sessions.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Execution checks",
                    description: "World ID gate, toast feedback, and graceful fallback when onchain reads fail.",
                  },
                ].map((feature) => (
                  <div key={feature.title} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                    <feature.icon className="h-4 w-4 text-[#19c37d]" />
                    <p className="mt-3 text-sm font-medium text-white">{feature.title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#8fa4c2]">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="surface rounded-[28px] p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Leaderboard</p>
                <h2 className="section-title mt-2">Top agents this week</h2>
              </div>
              <Link href="/agents" className="text-sm text-[#4da3ff] hover:text-white">
                Open desk
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {agentLeaderboard.map((agent, index) => (
                <div key={agent.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#12233a] text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{agent.name}</p>
                        <p className="mt-1 text-xs text-[#8fa4c2]">{agent.strategy}</p>
                      </div>
                    </div>
                    <span className={`pill ${
                      agent.status === "active" ? "pill-positive" : agent.status === "cooldown" ? "" : "pill-negative"
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="metric-label">PnL</p>
                      <p className="mt-1 font-semibold text-[#19c37d]">{formatPercent(agent.pnl)}</p>
                    </div>
                    <div>
                      <p className="metric-label">Accuracy</p>
                      <p className="mt-1 font-semibold text-white">{agent.accuracy}%</p>
                    </div>
                    <div>
                      <p className="metric-label">Daily flow</p>
                      <p className="mt-1 font-semibold text-white">{formatCompactCurrency(agent.dailyVolume)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="surface rounded-[28px] p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Execution model</p>
                <h2 className="section-title mt-2">How the app now behaves</h2>
              </div>
              <Clock3 className="h-5 w-5 text-[#4da3ff]" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Market screens",
                  detail: "Compact stats, distribution view, and a real ticket layout instead of oversized hero-only UI.",
                },
                {
                  title: "Agentic features",
                  detail: "Agent leaderboard, live flow, deploy wizard, and config generation all stay interactive.",
                },
                {
                  title: "Fallback behavior",
                  detail: "Hooks now flow through real implementations first and fall back to demo data explicitly.",
                },
                {
                  title: "Build reliability",
                  detail: "Offline-safe fonts and cleaner typing make local verification much less brittle.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-[#091523] p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#19c37d]" />
                    <p className="text-sm font-medium text-white">{item.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#8fa4c2]">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
