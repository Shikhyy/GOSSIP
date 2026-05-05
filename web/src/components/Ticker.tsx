"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const tickerItems = [
  { label: "SOL Price", value: "$198.42", change: "+2.4%", up: true },
  { label: "BTC Price", value: "$64,234", change: "+1.2%", up: true },
  { label: "ETH Price", value: "$3,421", change: "-0.8%", up: false },
  { label: "Active Markets", value: "18", change: "+3", up: true },
  { label: "24h Volume", value: "$2.4M", change: "+12%", up: true },
  { label: "AI Agents", value: "47", change: "+5", up: true },
];

export default function Ticker() {
  return (
    <div className="overflow-hidden py-3" style={{ background: "rgba(227,24,55,0.05)", borderBottom: "1px solid rgba(227,24,55,0.1)" }}>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 whitespace-nowrap"
      >
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider" style={{ color: "#666" }}>
              {item.label}
            </span>
            <span className="font-mono text-sm font-semibold text-white">
              {item.value}
            </span>
            <span className={`text-xs font-medium flex items-center gap-1 ${item.up ? "text-green-500" : "text-red-500"}`}>
              {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {item.change}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}