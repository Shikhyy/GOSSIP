"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Bot, CalendarClock, Loader2, PlusCircle, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { useToast } from "@/components/Toast";

const categories = ["Crypto", "Macro", "AI", "Weather", "Sports", "Politics"];

interface SuggestedMarket {
  title: string;
  category: string;
  mu: number;
  sigma: number;
  reasoning: string;
  trendSource: string;
}

interface SuggestionsResponse {
  success: boolean;
  markets?: SuggestedMarket[];
}

export default function CreateMarketPage() {
  const wallet = useWallet();
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    category: "Crypto",
    initialMu: "",
    initialSigma: "",
    resolutionSource: "Official source bundle",
    endsInDays: "7",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedMarket[]>([]);

  const fetchSuggestions = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/ai/generate-markets");
      const data = (await response.json()) as SuggestionsResponse;
      if (data.success) {
        setSuggestions(data.markets ?? []);
      }
    } catch {
      showToast("error", "Failed to refresh AI suggestions.");
    } finally {
      setIsAiLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchSuggestions(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchSuggestions]);

  const preview = useMemo(
    () => ({
      title: form.title || "Untitled market",
      category: form.category,
      mu: form.initialMu || "0.00",
      sigma: form.initialSigma || "0.00",
      source: form.resolutionSource,
      resolution: `${form.endsInDays} day window`,
    }),
    [form]
  );

  const handleCreate = async () => {
    if (!wallet.connected) {
      showToast("error", "Connect your wallet before creating a market.");
      return;
    }
    if (!form.title || !form.initialMu || !form.initialSigma) {
      showToast("error", "Fill in the title, consensus, and sigma first.");
      return;
    }

    setIsCreating(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      showToast("success", "Market draft created.");
      router.push("/markets");
    } catch {
      showToast("error", "Failed to create market.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="px-4 pb-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="surface-strong rounded-[28px] p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill pill-positive">
                <PlusCircle className="h-3.5 w-3.5" />
                Create contract
              </span>
              <span className="pill">
                <Bot className="h-3.5 w-3.5 text-[#4da3ff]" />
                AI-assisted ideation
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-semibold text-white">Create a market</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#9cb0ca]">
              The new flow is split between structured inputs and a live preview, so it feels like building a tradable contract rather than filling a generic form.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Resolution model", value: "Structured", detail: "Source, cadence, and horizon are explicit" },
                { label: "Agent assist", value: "Enabled", detail: "Trend ideas can prefill the contract" },
                { label: "Launch path", value: "Wallet gated", detail: "Same execution language as the rest of the app" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="metric-label">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-sm text-[#8fa4c2]">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="surface rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">AI radar</p>
                <h2 className="section-title mt-2">Suggested setups</h2>
              </div>
              <button
                onClick={fetchSuggestions}
                disabled={isAiLoading}
                className="trading-button trading-button-secondary px-3 py-2"
              >
                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
                Refresh
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.title}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      title: suggestion.title,
                      category: suggestion.category,
                      initialMu: String(suggestion.mu),
                      initialSigma: String(suggestion.sigma),
                    }))
                  }
                  className="w-full rounded-2xl border border-white/8 bg-[#091523] p-4 text-left hover:border-[#4da3ff]/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{suggestion.title}</p>
                    <span className="pill">{suggestion.category}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#8fa4c2]">{suggestion.trendSource}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#d7e5fa]">{suggestion.reasoning}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="surface rounded-[28px] p-6">
            <div>
              <p className="section-kicker">Contract inputs</p>
              <h2 className="section-title mt-2">Define the market</h2>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="metric-label">Market title</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="trading-input mt-2"
                  placeholder="e.g. SOL price at June month-end close"
                />
              </div>

              <div>
                <label className="metric-label">Category</label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setForm((current) => ({ ...current, category }))}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                        form.category === category
                          ? "bg-[#19c37d] text-[#03120b]"
                          : "bg-[#091523] text-white"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="metric-label">Initial consensus (μ)</label>
                  <input
                    value={form.initialMu}
                    onChange={(event) => setForm((current) => ({ ...current, initialMu: event.target.value }))}
                    className="trading-input mt-2"
                    type="number"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="metric-label">Initial volatility (σ)</label>
                  <input
                    value={form.initialSigma}
                    onChange={(event) => setForm((current) => ({ ...current, initialSigma: event.target.value }))}
                    className="trading-input mt-2"
                    type="number"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="metric-label">Resolution source</label>
                  <input
                    value={form.resolutionSource}
                    onChange={(event) => setForm((current) => ({ ...current, resolutionSource: event.target.value }))}
                    className="trading-input mt-2"
                  />
                </div>
                <div>
                  <label className="metric-label">Ends in (days)</label>
                  <input
                    value={form.endsInDays}
                    onChange={(event) => setForm((current) => ({ ...current, endsInDays: event.target.value }))}
                    className="trading-input mt-2"
                    type="number"
                  />
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="trading-button trading-button-primary w-full px-4 py-3 disabled:opacity-60"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {isCreating ? "Creating market" : "Create market"}
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="space-y-6">
            <div className="surface rounded-[28px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-kicker">Preview</p>
                  <h2 className="section-title mt-2">How it will read</h2>
                </div>
                <Sparkles className="h-5 w-5 text-[#ffb547]" />
              </div>

              <div className="mt-5 rounded-[24px] border border-white/8 bg-[#091523] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill pill-positive">draft</span>
                  <span className="pill">{preview.category}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-white">{preview.title}</h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                    <p className="metric-label">Consensus</p>
                    <p className="mt-2 text-xl font-semibold text-white">{preview.mu}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                    <p className="metric-label">Sigma</p>
                    <p className="mt-2 text-xl font-semibold text-white">{preview.sigma}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-[#d7e5fa]">
                  Resolution source: <span className="text-white">{preview.source}</span>
                </div>
                <div className="mt-3 rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-[#d7e5fa]">
                  Contract window: <span className="text-white">{preview.resolution}</span>
                </div>
              </div>
            </div>

            <div className="surface rounded-[28px] p-6">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[#4da3ff]" />
                <p className="section-kicker">Launch notes</p>
              </div>
              <div className="mt-4 space-y-3 text-sm text-[#8fa4c2]">
                <p className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  Use the AI radar to quickly seed titles, μ, and σ from narrative momentum.
                </p>
                <p className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  The create flow now mirrors the visual language of the trading screens, so it feels native to the product.
                </p>
                <p className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  Wallet gating remains intact, and the success path routes back to the market list.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
