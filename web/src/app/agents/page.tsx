"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Bot, BrainCircuit, Code2, Cpu, ShieldCheck, Sparkles } from "lucide-react";
import { agentLeaderboard, formatCompactCurrency, formatPercent, liveAgentActivity } from "@/lib/demo-data";

export default function AgentsPage() {
  return (
    <div className="px-4 pb-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="surface-strong rounded-[28px] p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill pill-positive">
                <Activity className="h-3.5 w-3.5" />
                47 active agents
              </span>
              <span className="pill">
                <BrainCircuit className="h-3.5 w-3.5 text-[#4da3ff]" />
                MCP deploy surface ready
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-semibold text-white">Agent desk</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#9cb0ca]">
              This section now reads like an operator surface: leaderboard, live execution feed, deployment entry point,
              and strategy framing. It’s built to support both demo-mode interaction and a path toward real connected agents.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              {[
                { label: "Agent flow", value: formatCompactCurrency(890000), detail: "TVL routed by agents" },
                { label: "Avg accuracy", value: "64.2%", detail: "Across active desks" },
                { label: "Daily trades", value: "12.4K", detail: "Cross-market execution" },
                { label: "Model mix", value: "Hybrid", detail: "Sequence, volatility, policy models" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="metric-label">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm text-[#8fa4c2]">{stat.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="surface rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Deploy</p>
                <h2 className="section-title mt-2">Ship an agent config</h2>
              </div>
              <Cpu className="h-5 w-5 text-[#19c37d]" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#8fa4c2]">
              Upload a model artifact, define execution constraints, and generate an MCP-ready payload that maps to the trading stack.
            </p>
            <Link href="/agents/deploy" className="trading-button trading-button-primary mt-6 w-full px-4 py-3">
              Open deploy flow
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-6 grid gap-3">
              {[
                {
                  icon: Code2,
                  title: "Config generation",
                  description: "Creates a structured MCP payload from UI inputs.",
                },
                {
                  icon: ShieldCheck,
                  title: "Risk controls",
                  description: "Budget, turnover, and confidence guardrails are editable in the deploy wizard.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-[#091523] p-4">
                  <item.icon className="h-4 w-4 text-[#4da3ff]" />
                  <p className="mt-3 text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[#8fa4c2]">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="surface rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Leaderboard</p>
                <h2 className="section-title mt-2">Top performers</h2>
              </div>
              <span className="pill">
                <Sparkles className="h-3.5 w-3.5 text-[#ffb547]" />
                Weekly ranking
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-white/8">
              <div className="grid grid-cols-[0.7fr_2fr_1.2fr_1fr_1fr_1fr] gap-3 bg-white/4 px-4 py-3 text-[11px] uppercase tracking-[0.08em] text-[#8fa4c2]">
                <span>Rank</span>
                <span>Agent</span>
                <span>Strategy</span>
                <span className="text-right">PnL</span>
                <span className="text-right">Accuracy</span>
                <span className="text-right">Daily flow</span>
              </div>
              {agentLeaderboard.map((agent, index) => (
                <div key={agent.id} className="table-row grid grid-cols-[0.7fr_2fr_1.2fr_1fr_1fr_1fr] gap-3 px-4 py-4">
                  <span className="text-sm font-semibold text-white">{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{agent.name}</p>
                    <p className="mt-1 text-xs text-[#8fa4c2]">{agent.summary}</p>
                  </div>
                  <span className="text-sm text-[#d7e5fa]">{agent.strategy}</span>
                  <span className="text-right text-sm font-medium text-[#19c37d]">{formatPercent(agent.pnl)}</span>
                  <span className="text-right text-sm text-white">{agent.accuracy}%</span>
                  <span className="text-right text-sm text-white">{formatCompactCurrency(agent.dailyVolume)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface rounded-[28px] p-6">
              <p className="section-kicker">Live feed</p>
              <h2 className="section-title mt-2">Recent actions</h2>
              <div className="mt-5 space-y-3">
                {liveAgentActivity.map((activity) => (
                  <div key={`${activity.agent}-${activity.timestamp}`} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{activity.agent}</p>
                      <span className="text-xs text-[#8fa4c2]">{activity.timestamp}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#d7e5fa]">{activity.market}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#8fa4c2]">{activity.action}</p>
                    <p className="mt-3 text-xs text-[#19c37d]">{activity.confidence}% confidence</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface rounded-[28px] p-6">
              <p className="section-kicker">Templates</p>
              <div className="mt-4 grid gap-3">
                {[
                  "Momentum / funding divergence",
                  "Macro event repricer",
                  "Tail risk scanner",
                ].map((template) => (
                  <div key={template} className="rounded-2xl border border-white/8 bg-[#091523] px-4 py-3 text-sm text-white">
                    {template}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
