"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Bot, Clock3, TrendingDown, TrendingUp, Wallet2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import PortfolioChart from "@/components/PortfolioChart";
import { TableRowSkeleton } from "@/components/Skeleton";
import { useUserPositions } from "@/hooks";
import { formatCompactCurrency, formatPercent, positionHistory, portfolioSeries } from "@/lib/demo-data";

export default function PortfolioPage() {
  const { positions, isLoading } = useUserPositions();

  const totalStaked = positions.reduce((sum, position) => sum + position.stake, 0);
  const totalPnl = positions.reduce((sum, position) => {
    const pnl = Number(position.currentPnl.replace("%", ""));
    return sum + (Number.isFinite(pnl) ? pnl : 0);
  }, 0);

  return (
    <div className="px-4 pb-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="surface-strong rounded-[28px] p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill pill-positive">
                <Wallet2 className="h-3.5 w-3.5" />
                Portfolio live
              </span>
              <span className="pill">
                <Bot className="h-3.5 w-3.5 text-[#4da3ff]" />
                Agent correlation 84%
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold text-white">Portfolio</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#9cb0ca]">
              Track open positions, payout convexity, and machine alignment in a denser trading layout. This page now behaves like a desk view instead of a generic dashboard.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              {[
                { label: "Account equity", value: formatCompactCurrency(4722), detail: "30 day curve" },
                { label: "Open stake", value: `${totalStaked.toFixed(0)} CASH`, detail: `${positions.length} positions` },
                { label: "Open P&L", value: formatPercent(totalPnl, 1), detail: "Across active positions" },
                { label: "Win ratio", value: "58%", detail: "Closed book" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="metric-label">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-sm text-[#8fa4c2]">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="surface rounded-[28px] p-6">
            <p className="section-kicker">Position health</p>
            <h2 className="section-title mt-2">Where you’re leaning</h2>
            <div className="mt-5 space-y-3">
              {[
                {
                  title: "Risk bias",
                  value: "Moderate long tail",
                  detail: "Most exposure is still centered around crypto and macro weekly contracts.",
                },
                {
                  title: "Agent overlap",
                  value: "84% aligned",
                  detail: "Current tickets are mostly in sync with live agent flow, with room for more contrarian sizing.",
                },
                {
                  title: "Cash efficiency",
                  value: "2.4x payout factor",
                  detail: "Open book stays concentrated in higher-liquidity contracts, keeping price discovery cleaner.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-[#091523] p-4">
                  <p className="metric-label">{item.title}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#8fa4c2]">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="surface rounded-[28px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Equity curve</p>
              <h2 className="section-title mt-2">30 day portfolio trajectory</h2>
            </div>
            <span className="pill pill-positive">+16.9% over 30 days</span>
          </div>
          <div className="mt-6 h-72">
            <PortfolioChart points={portfolioSeries} />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="surface rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Open positions</p>
                <h2 className="section-title mt-2">Active book</h2>
              </div>
              <span className="text-sm text-[#8fa4c2]">{positions.length} positions</span>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-white/8">
              <div className="grid grid-cols-[2.1fr_repeat(4,1fr)] gap-3 bg-white/4 px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-[#8fa4c2]">
                <span>Market</span>
                <span className="text-right">Prediction</span>
                <span className="text-right">Stake</span>
                <span className="text-right">P&L</span>
                <span className="text-right">Opened</span>
              </div>

              {isLoading ? (
                <div className="px-2 py-2">
                  {[0, 1, 2].map((row) => (
                    <TableRowSkeleton key={row} />
                  ))}
                </div>
              ) : positions.length === 0 ? (
                <EmptyState type="positions" />
              ) : (
                positions.map((position) => (
                  <div key={`${position.market}-${position.entered}`} className="table-row grid grid-cols-[2.1fr_repeat(4,1fr)] gap-3 px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">{position.market}</p>
                      <p className="mt-1 text-xs text-[#8fa4c2]">Current μ {position.mu}</p>
                    </div>
                    <div className="text-right text-sm font-medium text-white">${position.prediction}</div>
                    <div className="text-right text-sm text-white">{position.stake} CASH</div>
                    <div className={`text-right text-sm font-medium ${position.currentPnl.startsWith("+") ? "text-[#19c37d]" : "text-[#ff5f6d]"}`}>
                      <span className="inline-flex items-center gap-1">
                        {position.currentPnl.startsWith("+") ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {position.currentPnl}
                      </span>
                    </div>
                    <div className="text-right text-sm text-[#8fa4c2]">{position.entered}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="surface rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">History</p>
                <h2 className="section-title mt-2">Closed positions</h2>
              </div>
              <Clock3 className="h-4 w-4 text-[#4da3ff]" />
            </div>

            <div className="mt-5 space-y-3">
              {positionHistory.map((entry) => (
                <div key={`${entry.market}-${entry.date}`} className="rounded-2xl border border-white/8 bg-[#091523] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{entry.market}</p>
                      <p className="mt-1 text-xs text-[#8fa4c2]">
                        Predicted {entry.prediction} vs actual {entry.actual}
                      </p>
                    </div>
                    <span className={`pill ${entry.result === "win" ? "pill-positive" : "pill-negative"}`}>
                      {entry.result}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-[#8fa4c2]">{entry.date}</span>
                    <span className={entry.result === "win" ? "text-[#19c37d]" : "text-[#ff5f6d]"}>
                      {entry.result === "win" ? (
                        <span className="inline-flex items-center gap-1">
                          <ArrowUpRight className="h-3.5 w-3.5" /> +{entry.payout}
                        </span>
                      ) : (
                        `-${entry.stake}`
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
