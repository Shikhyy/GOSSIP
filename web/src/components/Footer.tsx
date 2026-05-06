"use client";

import Link from "next/link";
import { ArrowUpRight, Bot, Database, Layers3, ShieldCheck } from "lucide-react";

const footerLinks = [
  { label: "Markets", href: "/markets" },
  { label: "Create Market", href: "/markets/create" },
  { label: "Agents", href: "/agents" },
  { label: "Deploy Agent", href: "/agents/deploy" },
  { label: "Portfolio", href: "/portfolio" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/6 px-4 pb-10 pt-12">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface-strong rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#12233a]">
              <Layers3 className="h-5 w-5 text-[#4da3ff]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">GOSSIP execution stack</p>
              <p className="text-xs text-[#8fa4c2]">Markets, agents, and portfolio management in one interface.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <Database className="mb-3 h-4 w-4 text-[#19c37d]" />
              <p className="text-sm font-medium text-white">Continuous markets</p>
              <p className="mt-1 text-xs leading-relaxed text-[#8fa4c2]">
                Trade exact outcomes with distribution-aware pricing and liquidity snapshots.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <Bot className="mb-3 h-4 w-4 text-[#4da3ff]" />
              <p className="text-sm font-medium text-white">Agent workflows</p>
              <p className="mt-1 text-xs leading-relaxed text-[#8fa4c2]">
                Deploy model configs, monitor live runs, and compare machine flow to consensus.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <ShieldCheck className="mb-3 h-4 w-4 text-[#ffb547]" />
              <p className="text-sm font-medium text-white">Trading controls</p>
              <p className="mt-1 text-xs leading-relaxed text-[#8fa4c2]">
                Wallet-connected tickets, verification gates, and portfolio tracking out of the box.
              </p>
            </div>
          </div>
        </div>

        <div className="surface rounded-2xl p-6">
          <p className="section-kicker">Navigate</p>
          <div className="mt-4 grid gap-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-white hover:bg-white/5"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="h-4 w-4 text-[#8fa4c2]" />
              </Link>
            ))}
          </div>
          <p className="mt-5 text-xs text-[#6f84a1]">
            Built for fast iteration on Solana prediction products. Demo data remains available when the onchain program is unavailable.
          </p>
        </div>
      </div>
    </footer>
  );
}
