"use client";

import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Bot, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { formatCompactCurrency, formatPercent } from "@/lib/demo-data";

const tickerItems = [
  {
    label: "Market Volume",
    value: formatCompactCurrency(2400000),
    change: formatPercent(12.1),
    icon: Activity,
    up: true,
  },
  {
    label: "SOL Close Consensus",
    value: "$198.42",
    change: formatPercent(2.4),
    icon: TrendingUp,
    up: true,
  },
  {
    label: "Agent Flow",
    value: "$214K",
    change: formatPercent(4.7),
    icon: Bot,
    up: true,
  },
  {
    label: "Tail Vol",
    value: "24.5",
    change: formatPercent(-1.2),
    icon: TrendingDown,
    up: false,
  },
  {
    label: "Resolved Today",
    value: "14",
    change: "+3",
    icon: Sparkles,
    up: true,
  },
];

export default function Ticker() {
  return (
    <div className="border-b border-white/6 bg-[#091320]/95">
      <div className="mx-auto max-w-7xl overflow-hidden px-4">
        <motion.div
          className="flex min-w-max gap-10 py-2.5"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        >
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex items-center gap-3 whitespace-nowrap text-sm">
              <item.icon className="h-3.5 w-3.5 text-[#4da3ff]" />
              <span className="text-xs uppercase tracking-[0.08em] text-[#8fa4c2]">{item.label}</span>
              <span className="font-mono text-sm font-semibold text-white">{item.value}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${item.up ? "text-[#19c37d]" : "text-[#ff5f6d]"}`}>
                {item.up ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {item.change}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
