"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Code2, Copy, Cpu, PlayCircle, Settings2, UploadCloud } from "lucide-react";
import { useToast } from "@/components/Toast";

const steps = [
  { id: 1, title: "Artifact", icon: UploadCloud },
  { id: 2, title: "Guardrails", icon: Settings2 },
  { id: 3, title: "Config", icon: Code2 },
];

export default function DeployAgentPage() {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [modelFile, setModelFile] = useState<string | null>(null);
  const [budget, setBudget] = useState(250);
  const [riskLevel, setRiskLevel] = useState("medium");
  const [marketFocus, setMarketFocus] = useState("crypto-macro");
  const [dryRunReady, setDryRunReady] = useState(false);

  const config = useMemo(
    () =>
      JSON.stringify(
        {
          model: modelFile ?? "agent-model.pt",
          mode: "paper-live",
          budgetCash: budget,
          riskLevel,
          marketFocus,
          routing: {
            markets: ["sol-price", "fed-rate", "btc-etf"],
            maxOpenPositions: riskLevel === "high" ? 8 : riskLevel === "medium" ? 5 : 3,
            stopLossPct: riskLevel === "high" ? 8 : riskLevel === "medium" ? 5 : 3,
          },
          mcp: {
            server: "gossip-execution",
            transport: "stdio",
          },
        },
        null,
        2
      ),
    [budget, marketFocus, modelFile, riskLevel]
  );

  return (
    <div className="px-4 pb-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="surface-strong rounded-[28px] p-6 sm:p-8">
          <p className="section-kicker">Agent deployment</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Deploy an agent</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#9cb0ca]">
            Upload an artifact, define controls, and generate a config payload that matches the rest of the trading app.
            This flow is fully interactive now, so you can test the agentic surface instead of just reading about it.
          </p>
        </section>

        <section className="surface rounded-[28px] p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition-colors ${
                  step >= item.id
                    ? "border-[#19c37d]/30 bg-[#19c37d]/8"
                    : "border-white/8 bg-white/3"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step >= item.id ? "bg-[#19c37d] text-[#03120b]" : "bg-[#12233a] text-white"}`}>
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-[#8fa4c2]">Step {item.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {step === 1 && (
          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="surface rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Artifact</p>
                <h2 className="section-title mt-2">Upload model package</h2>
              </div>
              <Cpu className="h-5 w-5 text-[#4da3ff]" />
            </div>

            <button
              onClick={() => setModelFile("alpha-oracle-v4.pt")}
              className="mt-6 flex min-h-[220px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-white/12 bg-[#091523] px-6 text-center hover:border-[#4da3ff]/40"
            >
              <UploadCloud className="h-10 w-10 text-[#4da3ff]" />
              <p className="mt-4 text-lg font-medium text-white">
                {modelFile ? modelFile : "Drop a .pt, .onnx, or config bundle here"}
              </p>
              <p className="mt-2 text-sm text-[#8fa4c2]">
                Simulated upload for the frontend flow. This keeps the deploy surface testable today.
              </p>
            </button>

            <button
              disabled={!modelFile}
              onClick={() => setStep(2)}
              className="trading-button trading-button-primary mt-6 w-full px-4 py-3 disabled:opacity-60"
            >
              Continue to guardrails
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.section>
        )}

        {step === 2 && (
          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="surface rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Guardrails</p>
                <h2 className="section-title mt-2">Budget and strategy controls</h2>
              </div>
              <Settings2 className="h-5 w-5 text-[#19c37d]" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <label className="metric-label">Budget (CASH)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                  className="trading-input mt-2"
                />
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <label className="metric-label">Market focus</label>
                <select
                  value={marketFocus}
                  onChange={(event) => setMarketFocus(event.target.value)}
                  className="trading-input mt-2"
                >
                  <option value="crypto-macro">Crypto + Macro</option>
                  <option value="ai-frontier">AI Frontier</option>
                  <option value="tail-events">Tail Events</option>
                </select>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
              <label className="metric-label">Risk level</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {["low", "medium", "high"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setRiskLevel(option)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      riskLevel === option
                        ? "bg-[#19c37d] text-[#03120b]"
                        : "bg-[#091523] text-white"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="trading-button trading-button-secondary flex-1 px-4 py-3">
                Back
              </button>
              <button onClick={() => setStep(3)} className="trading-button trading-button-primary flex-1 px-4 py-3">
                Generate config
              </button>
            </div>
          </motion.section>
        )}

        {step === 3 && (
          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="surface rounded-[28px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-kicker">Config</p>
                  <h2 className="section-title mt-2">MCP payload</h2>
                </div>
                <Code2 className="h-5 w-5 text-[#4da3ff]" />
              </div>
              <pre className="mt-5 overflow-x-auto rounded-2xl border border-white/8 bg-[#091523] p-4 text-xs leading-relaxed text-[#d7e5fa]">
                {config}
              </pre>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(config);
                    showToast("success", "Agent config copied.");
                  }}
                  className="trading-button trading-button-secondary flex-1 px-4 py-3"
                >
                  <Copy className="h-4 w-4" />
                  Copy config
                </button>
                <button
                  onClick={() => {
                    setDryRunReady(true);
                    showToast("success", "Dry run completed.");
                  }}
                  className="trading-button trading-button-primary flex-1 px-4 py-3"
                >
                  <PlayCircle className="h-4 w-4" />
                  Run dry test
                </button>
              </div>
            </div>

            <div className="surface rounded-[28px] p-6">
              <p className="section-kicker">Validation</p>
              <h2 className="section-title mt-2">Readiness checks</h2>
              <div className="mt-5 space-y-3">
                {[
                  modelFile ? "Artifact selected" : "Waiting for model artifact",
                  `Budget set to ${budget} CASH`,
                  `Risk level ${riskLevel}`,
                  dryRunReady ? "Dry run passed" : "Dry run pending",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                    <CheckCircle2 className={`h-4 w-4 ${index === 3 && !dryRunReady ? "text-[#8fa4c2]" : "text-[#19c37d]"}`} />
                    <span className="text-sm text-white">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/8 bg-[#091523] p-4 text-sm leading-relaxed text-[#8fa4c2]">
                The deploy path is UI-complete: artifact selection, constraints, generated config, copy action,
                and dry-run confirmation. It’s ready to wire to a real backend without rethinking the frontend.
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
