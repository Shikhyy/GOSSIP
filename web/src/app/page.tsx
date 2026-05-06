"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, TrendingUp, Activity, Cpu, Zap, BarChart3, Target, Shield } from "lucide-react";

const stats = [
  { label: "Total Volume", value: "$2.4M" },
  { label: "Active Markets", value: "18" },
  { label: "AI Agents", value: "47" },
  { label: "Avg Yield", value: "12.4%" },
];

const features = [
  {
    num: "01",
    title: "Continuous Markets",
    description: "Bet on exact values, not just yes/no. Gaussian AMM enables infinite-resolution predictions with mathematically fair pricing.",
  },
  {
    num: "02",
    title: "Infinite Upside",
    description: "Predict black swan events and earn 1000x payouts. The further from consensus, the higher your reward when you're right.",
  },
  {
    num: "03",
    title: "AI Agent Economy",
    description: "Deploy autonomous ML agents via MCP. Let LSTM models arbitrage markets 24/7 while you sleep.",
  },
  {
    num: "04",
    title: "Yield-Native Pools",
    description: "Capital never sits idle. All locked liquidity earns yield via Reflect's interest-bearing primitives until resolution.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
};

function CountUp({ value, suffix = '', prefix = '' }: { value: string; suffix?: string; prefix?: string }) {
  const [display, setDisplay] = useState(prefix + "0" + suffix);
  
  useEffect(() => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) {
      setDisplay(value);
      return;
    }
    let start = 0;
    const duration = 1500;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(prefix + start.toFixed(1) + suffix);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, prefix, suffix]);
  
  return <>{display}</>;
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-16 pb-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[70vh]">
            {/* Left Text */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-8 h-[2px]" style={{ background: "#E31837" }} />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#C25B5B" }}>
                  Solana Prediction Markets
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] mb-8"
              >
                GOSSIP<br />
                <span className="gradient-red">PROTOCOL</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="text-lg sm:text-xl max-w-lg mb-12 leading-relaxed font-medium"
                style={{ color: "#999999" }}
              >
                The Infinite Upside Continuous Prediction Market. 
                Where human intuition meets machine intelligence on the Solana blockchain.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/markets"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:scale-[1.03]"
                  style={{ background: "#E31837" }}
                >
                  <span>Explore Markets</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white border transition-all hover:border-[#E31837]"
                  style={{ borderColor: "rgba(255,255,255,0.12)" }}
                >
                  Deploy Agent
                </Link>
              </motion.div>
            </div>

            {/* Right Visual Block */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-5 hidden lg:block"
            >
              <div className="relative">
                <div className="w-full aspect-square" style={{ background: "#4A0404" }} />
                <div className="absolute inset-4 flex flex-col justify-between p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ background: "#E31837" }} />
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "#C25B5B" }}>Live Market</span>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-white mb-1">$198.42</p>
                    <p className="text-xs uppercase tracking-wider" style={{ color: "#C25B5B" }}>Consensus Price / SOL</p>
                  </div>
                  <div className="w-full h-[1px]" style={{ background: "rgba(227,24,55,0.2)" }} />
                  <div className="flex justify-between text-xs" style={{ color: "#999999" }}>
                    <span>Volatility: 24.5</span>
                    <span>Liquidity: 124.5K</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Row — Maroon Blocks with Animated Counters */}
      <section className="px-4 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="p-6 relative group overflow-hidden"
              style={{ background: i === 1 || i === 2 ? "#4A0404" : "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}
            >
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1 relative z-10">
                <CountUp value={stat.value} suffix={stat.label.includes('%') ? '%' : ''} prefix={stat.label.includes('$') ? '$' : ''} />
              </p>
              <p className="text-xs uppercase tracking-wider relative z-10" style={{ color: "#999999" }}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Human vs Machine Section */}
      <section className="px-4 py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-white/5" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#E31837]" />
              <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "#C25B5B" }}>The Arena</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1]">
              HUMAN INTUITION<br />
              <span className="text-white/20">VS</span><br />
              MACHINE LOGIC
            </h2>
            <p className="text-lg text-neutral-400 leading-relaxed max-w-md">
              GOSSIP is a multi-sided ecosystem designed to pit human edge against 
              autonomous machine learning algorithms.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <p className="text-xl font-bold text-white mb-1">WORLD ID</p>
                <p className="text-xs uppercase tracking-widest text-[#999]">Verified Humans</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white mb-1">MCP SDK</p>
                <p className="text-xs uppercase tracking-widest text-[#999]">Autonomous Agents</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 aspect-square flex items-center justify-center"
            style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.15)" }}
          >
            <div className="absolute inset-0 grid-bg opacity-10" />
            <div className="relative z-10 w-full h-full flex items-center justify-center">
               <div className="w-full h-px bg-red-500/20 absolute rotate-45" />
               <div className="w-full h-px bg-red-500/20 absolute -rotate-45" />
               <div className="w-24 h-24 rounded-full border-2 border-red-500 flex items-center justify-center bg-black">
                 <Cpu className="w-10 h-10 text-red-500" />
               </div>
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className="absolute w-48 h-48 border border-white/5 rounded-full"
               />
               <motion.div 
                 animate={{ rotate: -360 }}
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                 className="absolute w-64 h-64 border border-white/5 rounded-full"
               />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features — Grid with Red Accent */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px]" style={{ background: "#E31837" }} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#C25B5B" }}>Why Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Built for the <span className="gradient-red">next generation</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {features.map((f) => (
              <motion.div
                key={f.num}
                variants={itemVariants}
                className="group p-8 transition-all hover:bg-[#4A0404]"
                style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.08)" }}
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="text-4xl font-bold opacity-20" style={{ color: "#E31837" }}>{f.num}</span>
                  <div className="w-8 h-[2px] mt-4" style={{ background: "#E31837", opacity: 0.5 }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 uppercase tracking-wide">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#999999" }}>{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA — Red Block */}
      <section className="px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 lg:p-14" style={{ background: "#E31837" }}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                READY TO<br />START PREDICTING?
              </h2>
              <p className="text-sm text-white/70 mb-8 max-w-sm leading-relaxed">
                Connect your wallet and dive into the most advanced prediction market on Solana.
              </p>
              <Link
                href="/markets"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[#E31837] bg-white transition-all hover:bg-white/90"
              >
                <span>Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="hidden lg:block p-14" style={{ background: "#4A0404", border: "1px solid rgba(227,24,55,0.15)", borderLeft: "none" }}>
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 animate-pulse" style={{ background: "#E31837" }} />
                  <span className="text-[10px] uppercase tracking-widest text-white/50">Live on Devnet</span>
                </div>
                <div className="space-y-6">
                  {[
                    { label: "GAUSSIAN AMM", val: "Active" },
                    { label: "YIELD NATIVE", val: "12.4% APY" },
                    { label: "AI ORACLE", val: "Arcium" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-xs font-semibold tracking-wider text-white/40">{item.label}</span>
                      <span className="text-sm font-medium text-white">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
