"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { Plus, Tag, Calendar, FileText, ArrowRight, Loader2 } from "lucide-react";

const CATEGORIES = ["Crypto", "Finance", "Weather", "Macro", "AI", "Sports", "Politics"];

export default function CreateMarketPage() {
  const wallet = useWallet();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [form, setForm] = useState({
    title: "",
    category: "Crypto",
    initialMu: "",
    initialSigma: "",
    resolutionSource: "AI Judge Committee",
    endsInDays: "7",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchAiSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-markets");
      const data = await res.json();
      if (data.success) {
        setAiSuggestions(data.markets);
      }
    } catch (err) {
      showToast("error", "Failed to fetch AI trends");
    } finally {
      setIsAiLoading(false);
    }
  };

  useState(() => {
    fetchAiSuggestions();
  });

  const handleSubmit = async () => {
    if (!wallet.connected) {
      showToast("error", "Please connect your wallet first");
      return;
    }
    if (!form.title || !form.initialMu || !form.initialSigma) {
      showToast("error", "Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast("success", "Market created successfully!");
      router.push("/markets");
    } catch (err) {
      showToast("error", "Failed to create market");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-20">
      <div className="max-w-2xl mx-auto pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-[2px]" style={{ background: "#E31837" }} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#C25B5B" }}>Create Market</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">NEW MARKET</h1>
          <p style={{ color: "#999999" }}>Launch a new continuous prediction market</p>
        </motion.div>

        {/* GOSSIP AI: Trend Analyzer */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 p-8"
          style={{ background: "#0D0202", border: "1px solid rgba(59, 130, 246, 0.3)", boxShadow: "0 0 40px rgba(59, 130, 246, 0.1)" }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Zap className={`w-5 h-5 ${isAiLoading ? 'animate-pulse text-blue-400' : 'text-blue-500'}`} />
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white">GOSSIP AI: Trend Analyzer</h2>
            </div>
            <button 
              onClick={fetchAiSuggestions}
              disabled={isAiLoading}
              className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-all flex items-center gap-2"
            >
              {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
              {isAiLoading ? 'SCANNING...' : 'REFRESH TRENDS'}
            </button>
          </div>
          
          {isAiLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-blue-500/50 uppercase tracking-[0.2em]">Analyzing X (Twitter) & Global Sentiment...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setForm({ 
                    ...form, 
                    title: suggestion.title, 
                    category: suggestion.category, 
                    initialMu: suggestion.mu.toString(), 
                    initialSigma: suggestion.sigma.toString() 
                  })}
                  className="w-full flex items-center justify-between p-4 group transition-all hover:bg-blue-500/5 border border-white/5 hover:border-blue-500/30 text-left"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-xs font-bold text-white mb-1 uppercase tracking-tight">{suggestion.title}</p>
                    <div className="flex items-center gap-3">
                      <p className="text-[9px] font-bold text-blue-500/50 uppercase tracking-widest">{suggestion.category} • {suggestion.trendSource}</p>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <p className="text-[8px] font-medium text-neutral-500 italic lowercase truncate max-w-[200px]">Reasoning: {suggestion.reasoning}</p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
          <p className="text-[8px] text-neutral-600 mt-6 uppercase tracking-widest font-bold">Model: GOSSIP-Trend-Analyzer-v1 • Last Scanned: {new Date().toLocaleTimeString()}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          <div className="group">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: "#666" }}>
              <FileText className="w-4 h-4 text-[#E31837]" /> Market Proposal Title
            </label>
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/5 group-focus-within:bg-red-500/10 transition-colors pointer-events-none" />
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., SOL PRICE AT DEC 31 CLOSE"
                className="w-full px-5 py-5 text-xl font-black text-white uppercase placeholder:text-white/10 focus:outline-none transition-all"
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: "#666" }}>
              <Tag className="w-4 h-4 text-[#E31837]" /> Vertical Selection
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all"
                  style={{
                    background: form.category === cat ? "#E31837" : "rgba(255,255,255,0.03)",
                    color: "#FFFFFF",
                    border: form.category === cat ? "1px solid #E31837" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: "#666" }}>
                Initial Consensus (μ)
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/5 group-focus-within:bg-red-500/10 transition-colors pointer-events-none" />
                <input
                  type="number"
                  value={form.initialMu}
                  onChange={(e) => setForm({ ...form, initialMu: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-5 py-5 text-xl font-black text-white focus:outline-none transition-all font-mono"
                  style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: "#666" }}>
                Volatility Index (σ)
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/5 group-focus-within:bg-red-500/10 transition-colors pointer-events-none" />
                <input
                  type="number"
                  value={form.initialSigma}
                  onChange={(e) => setForm({ ...form, initialSigma: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-5 py-5 text-xl font-black text-white focus:outline-none transition-all font-mono"
                  style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: "#666" }}>
                <FileText className="w-4 h-4 text-[#E31837]" /> Oracle Source
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/5 group-focus-within:bg-red-500/10 transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={form.resolutionSource}
                  onChange={(e) => setForm({ ...form, resolutionSource: e.target.value })}
                  className="w-full px-5 py-5 text-sm font-bold text-white uppercase focus:outline-none transition-all"
                  style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>
            <div className="group">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] mb-4" style={{ color: "#666" }}>
                <Calendar className="w-4 h-4 text-[#E31837]" /> Lifespan (Days)
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/5 group-focus-within:bg-red-500/10 transition-colors pointer-events-none" />
                <input
                  type="number"
                  value={form.endsInDays}
                  onChange={(e) => setForm({ ...form, endsInDays: e.target.value })}
                  className="w-full px-5 py-5 text-xl font-black text-white focus:outline-none transition-all font-mono"
                  style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>
          </div>

          <div className="p-8 space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4">Protocol Parameters</h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span style={{ color: "#666" }}>LMSR Weight (b)</span>
                <span className="text-white font-mono">1,000</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span style={{ color: "#666" }}>Protocol Fee</span>
                <span className="text-white font-mono">0.5%</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span style={{ color: "#666" }}>Creator Royalty</span>
                <span className="text-white font-mono">0.1%</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span style={{ color: "#666" }}>Pool Yield</span>
                <span className="text-green-500 font-mono">12.4% APY</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="w-full py-6 font-black text-white uppercase tracking-[0.3em] text-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 flex justify-center items-center gap-3 shadow-[0_0_30px_rgba(227,24,55,0.2)]"
            style={{ background: "#E31837" }}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Broadcasting...
              </>
            ) : (
              <>
                Deploy Market <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}