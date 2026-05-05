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

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#C25B5B" }}>
              <FileText className="w-4 h-4" /> Market Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Will SOL hit $300 by Dec 31?"
              className="w-full px-4 py-4 text-white placeholder:text-neutral-500 focus:outline-none"
              style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.2)" }}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#C25B5B" }}>
              <Tag className="w-4 h-4" /> Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className="px-4 py-2 text-sm uppercase tracking-wider transition-all"
                  style={{
                    background: form.category === cat ? "#E31837" : "transparent",
                    color: "#FFFFFF",
                    border: form.category === cat ? "none" : "1px solid rgba(227,24,55,0.2)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#C25B5B" }}>
                Initial Consensus (μ)
              </label>
              <input
                type="number"
                value={form.initialMu}
                onChange={(e) => setForm({ ...form, initialMu: e.target.value })}
                placeholder="e.g., 198.42"
                className="w-full px-4 py-4 text-white placeholder:text-neutral-500 focus:outline-none font-mono"
                style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.2)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#C25B5B" }}>
                Volatility (σ)
              </label>
              <input
                type="number"
                value={form.initialSigma}
                onChange={(e) => setForm({ ...form, initialSigma: e.target.value })}
                placeholder="e.g., 24.5"
                className="w-full px-4 py-4 text-white placeholder:text-neutral-500 focus:outline-none font-mono"
                style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.2)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#C25B5B" }}>
                <FileText className="w-4 h-4" /> Resolution Source
              </label>
              <input
                type="text"
                value={form.resolutionSource}
                onChange={(e) => setForm({ ...form, resolutionSource: e.target.value })}
                className="w-full px-4 py-4 text-white focus:outline-none"
                style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.2)" }}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#C25B5B" }}>
                <Calendar className="w-4 h-4" /> Ends In (days)
              </label>
              <input
                type="number"
                value={form.endsInDays}
                onChange={(e) => setForm({ ...form, endsInDays: e.target.value })}
                className="w-full px-4 py-4 text-white focus:outline-none font-mono"
                style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.2)" }}
              />
            </div>
          </div>

          <div className="p-4 mt-4" style={{ background: "rgba(227,24,55,0.05)", border: "1px solid rgba(227,24,55,0.1)" }}>
            <h4 className="text-sm font-semibold text-white mb-2">Market Parameters</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span style={{ color: "#999999" }}>LMSR Parameter (b):</span>
                <span className="text-white ml-2 font-mono">1,000</span>
              </div>
              <div>
                <span style={{ color: "#999999" }}>Protocol Fee:</span>
                <span className="text-white ml-2 font-mono">0.5%</span>
              </div>
              <div>
                <span style={{ color: "#999999" }}>Creator Fee:</span>
                <span className="text-white ml-2 font-mono">0.1%</span>
              </div>
              <div>
                <span style={{ color: "#999999" }}>Yield:</span>
                <span className="text-green-500 ml-2 font-mono">12.4% APY</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="w-full py-4 mt-4 font-semibold text-white uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "#E31837" }}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Market...
              </>
            ) : (
              <>
                Create Market <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}