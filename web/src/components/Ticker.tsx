"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight, Bot, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { markets, formatCompactCurrency, formatPercent } from "@/lib/demo-data";

function TickerItem({ item }: { item: { label: string; value: string; change: string; icon: any; up: boolean } }) {
  return (
    <div className="flex items-center gap-3 whitespace-nowrap text-sm">
      <item.icon className="h-3.5 w-3.5 text-[#4da3ff]" />
      <span className="text-xs uppercase tracking-[0.08em] text-[#8fa4c2]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{item.label}</span>
      <span className="font-mono text-sm font-semibold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</span>
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${item.up ? "text-[#19c37d]" : "text-[#ff5f6d]"}`}>
        {item.up ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {item.change}
      </span>
    </div>
  );
}

export default function Ticker() {
  const tickerItems = useMemo(() => {
    // Get live data from markets array
    const solMarket = markets.find(m => m.id === 'sol-price');
    const totalVolume = markets.reduce((sum, m) => sum + m.volume24h, 0);
    const totalLiquidity = markets.reduce((sum, m) => sum + m.liquidity, 0);
    const avgSigma = markets.reduce((sum, m) => sum + m.sigma, 0) / markets.length;
    const resolvedCount = markets.filter(m => m.status === 'resolving').length;

    return [
      {
        label: "Market Volume",
        value: formatCompactCurrency(totalVolume),
        change: formatPercent(solMarket?.change24h || 0),
        icon: Activity,
        up: (solMarket?.change24h || 0) >= 0,
      },
      {
        label: "SOL Close Consensus",
        value: `$${solMarket?.consensus.toFixed(2) || '0.00'}`,
        change: formatPercent(solMarket?.change24h || 0),
        icon: TrendingUp,
        up: (solMarket?.change24h || 0) >= 0,
      },
      {
        label: "Total Liquidity",
        value: formatCompactCurrency(totalLiquidity),
        change: formatPercent(5.2),
        icon: Bot,
        up: true,
      },
      {
        label: "Avg Volatility (σ)",
        value: avgSigma.toFixed(1),
        change: formatPercent(-1.2),
        icon: TrendingDown,
        up: false,
      },
      {
        label: "Active Markets",
        value: markets.length.toString(),
        change: `+${resolvedCount}`,
        icon: Sparkles,
        up: true,
      },
    ];
  }, []);

  return (
    <div className="border-b border-white/6 bg-[#091320]/95">
      <div className="mx-auto max-w-7xl overflow-hidden px-4">
        <motion.div
          className="flex min-w-max gap-10 py-2.5"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        >
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <TickerItem key={`${item.label}-${index}`} item={item} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
