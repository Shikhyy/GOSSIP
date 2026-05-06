"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Funnel,
  PlusCircle,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import {
  formatCompactCurrency,
  formatPercent,
  liveAgentActivity,
  markets,
  type MarketCategory,
} from "@/lib/demo-data";

const categories: Array<MarketCategory | "All"> = [
  "All",
  "Crypto",
  "Macro",
  "AI",
  "Weather",
  "Sports",
  "Politics",
];

export default function MarketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | "All">("All");

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      const matchesCategory =
        selectedCategory === "All" || market.category === selectedCategory;
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        market.title.toLowerCase().includes(normalizedSearch) ||
        market.subtitle.toLowerCase().includes(normalizedSearch) ||
        market.category.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const liveCount = markets.filter((market) => market.status === "live").length;
  const volume = markets.reduce((sum, market) => sum + market.volume24h, 0);

  return (
    <div className="px-4 pb-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-strong rounded-[28px] p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill pill-positive">
                <TrendingUp className="h-3.5 w-3.5" />
                {liveCount} live markets
              </span>
              <span className="pill">
                <Bot className="h-3.5 w-3.5 text-[#4da3ff]" />
                Agent-linked market discovery
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-semibold text-white">Markets</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#9cb0ca]">
              Browse continuous contracts, filter by narrative cluster, and jump straight into a compact
              order flow. The layout is designed for scanning like a trading product, not a landing page.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <p className="metric-label">24h market volume</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatCompactCurrency(volume)}</p>
                <p className="mt-2 text-sm text-[#19c37d]">{formatPercent(12.1)}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <p className="metric-label">Average participation</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {Math.round(
                    markets.reduce((sum, market) => sum + market.participation, 0) / markets.length
                  )}
                </p>
                <p className="mt-2 text-sm text-[#8fa4c2]">Traders per market</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <p className="metric-label">Resolution cadence</p>
                <p className="mt-2 text-2xl font-semibold text-white">Daily</p>
                <p className="mt-2 text-sm text-[#8fa4c2]">Pyth, NOAA, official reports</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="surface rounded-[28px] p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Launch</p>
                <h2 className="section-title mt-2">Create a new contract</h2>
              </div>
              <PlusCircle className="h-5 w-5 text-[#19c37d]" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#8fa4c2]">
              Open a new market with AI-assisted idea sourcing, initial consensus inputs, and an execution-ready
              resolution spec.
            </p>
            <Link href="/markets/create" className="trading-button trading-button-primary mt-6 w-full px-4 py-3">
              Create market
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-6 space-y-3">
              {liveAgentActivity.slice(0, 2).map((item) => (
                <div key={`${item.agent}-${item.market}`} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{item.agent}</p>
                    <span className="text-xs text-[#8fa4c2]">{item.timestamp}</span>
                  </div>
                  <p className="mt-2 text-sm text-[#d7e5fa]">{item.market}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[#8fa4c2]">{item.action}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="surface rounded-[28px] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8fa4c2]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="trading-input pl-11"
                    placeholder="Search by contract, category, or narrative"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  <div className="pill">
                    <Funnel className="h-3.5 w-3.5 text-[#4da3ff]" />
                    Filter
                  </div>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-[#19c37d] text-[#03120b]"
                          : "bg-white/4 text-[#d7e5fa] hover:bg-white/8"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredMarkets.length === 0 ? (
              <EmptyState type="search" searchTerm={searchTerm} />
            ) : (
              <div className="grid gap-4">
                {filteredMarkets.map((market, index) => (
                  <motion.div
                    key={market.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link href={`/market/${market.id}`} className="surface block rounded-[24px] p-5 hover:bg-white/[0.04]">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`pill ${
                              market.status === "live"
                                ? "pill-positive"
                                : market.status === "resolving"
                                  ? ""
                                  : "pill-negative"
                            }`}>
                              {market.status}
                            </span>
                            <span className="pill">{market.category}</span>
                            {market.featured && (
                              <span className="pill">
                                <Sparkles className="h-3.5 w-3.5 text-[#ffb547]" />
                                Featured
                              </span>
                            )}
                          </div>
                          <h2 className="mt-4 text-xl font-semibold text-white">{market.title}</h2>
                          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#8fa4c2]">{market.subtitle}</p>
                        </div>

                        <div className="grid min-w-[280px] gap-3 sm:grid-cols-2 xl:min-w-[380px] xl:grid-cols-4">
                          <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                            <p className="metric-label">Consensus</p>
                            <p className="mt-2 text-lg font-semibold text-white">
                              {market.unit}
                              {market.consensus}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                            <p className="metric-label">24h</p>
                            <p className={`mt-2 text-lg font-semibold ${market.change24h >= 0 ? "text-[#19c37d]" : "text-[#ff5f6d]"}`}>
                              {formatPercent(market.change24h)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                            <p className="metric-label">Liquidity</p>
                            <p className="mt-2 text-lg font-semibold text-white">{formatCompactCurrency(market.liquidity)}</p>
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                            <p className="metric-label">Resolve</p>
                            <p className="mt-2 text-sm font-medium text-white">{market.resolutionLabel}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
                        <div className="flex flex-wrap gap-5 text-sm">
                          <span className="text-[#8fa4c2]">
                            Outcome: <span className="text-white">{market.outcomeLabel}</span>
                          </span>
                          <span className="text-[#8fa4c2]">
                            Participants: <span className="text-white">{market.participation}</span>
                          </span>
                          <span className="text-[#8fa4c2]">
                            Source: <span className="text-white">{market.resolutionSource}</span>
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-2 text-sm text-[#4da3ff]">
                          Open ticket
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="surface rounded-[28px] p-6">
              <p className="section-kicker">Flow cues</p>
              <h2 className="section-title mt-2">What traders are watching</h2>
              <div className="mt-5 space-y-3">
                {markets.slice(0, 3).map((market) => (
                  <div key={market.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{market.title}</p>
                      <span className={`text-sm font-semibold ${market.change24h >= 0 ? "text-[#19c37d]" : "text-[#ff5f6d]"}`}>
                        {formatPercent(market.change24h)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#8fa4c2]">
                      {market.agentBias === "bullish"
                        ? "Agents skew above crowd consensus."
                        : market.agentBias === "bearish"
                          ? "Agents are leaning into downside tails."
                          : "Agent flow is roughly aligned with market mean."}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface rounded-[28px] p-6">
              <p className="section-kicker">Agent scan</p>
              <div className="mt-4 space-y-3">
                {liveAgentActivity.map((item) => (
                  <div key={`${item.agent}-${item.timestamp}`} className="rounded-2xl border border-white/8 bg-[#091523] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{item.agent}</p>
                      <span className="text-xs text-[#8fa4c2]">{item.confidence}%</span>
                    </div>
                    <p className="mt-2 text-sm text-[#d7e5fa]">{item.market}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#8fa4c2]">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
