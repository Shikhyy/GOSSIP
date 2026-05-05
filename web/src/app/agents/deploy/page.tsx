"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Settings, Code, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  { id: 1, title: "Upload Model", icon: Upload },
  { id: 2, title: "Configure", icon: Settings },
  { id: 3, title: "MCP Config", icon: Code },
];

export default function DeployAgentPage() {
  const [step, setStep] = useState(1);
  const [modelFile, setModelFile] = useState<string | null>(null);
  const [params, setParams] = useState({ budget: 100, riskLevel: "medium" });
  const [mcpConfig, setMcpConfig] = useState<string | null>(null);

  return (
    <div className="min-h-screen px-4 pb-20">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Steps indicator */}
        <div className="flex justify-between mb-12">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{
                  background: step >= s.id ? "#E31837" : "rgba(255,255,255,0.1)",
                }}
              >
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm text-white/60 hidden sm:block">{s.title}</span>
              {i < steps.length - 1 && <div className="w-12 h-px mx-4 bg-white/10" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-white mb-6">Upload Your Model</h2>
            <div
              className="border-2 border-dashed p-12 text-center cursor-pointer hover:border-[#E31837] transition-colors"
              style={{ borderColor: "rgba(227,24,55,0.3)" }}
              onClick={() => setModelFile("model.pt")}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p className="text-white/60">Drop your .pt file here or click to browse</p>
            </div>
            {modelFile && (
              <div className="mt-4 p-4 flex items-center gap-3" style={{ background: "#1A0808" }}>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-white">{modelFile}</span>
              </div>
            )}
            <button
              onClick={() => setStep(2)}
              disabled={!modelFile}
              className="mt-6 w-full py-4 font-semibold text-white uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "#E31837" }}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-white mb-6">Configure Parameters</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">Budget (CASH)</label>
                <input
                  type="number"
                  value={params.budget}
                  onChange={(e) => setParams({ ...params, budget: parseInt(e.target.value) })}
                  className="w-full p-4 text-white"
                  style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.2)" }}
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Risk Level</label>
                <div className="flex gap-2">
                  {["low", "medium", "high"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setParams({ ...params, riskLevel: r })}
                      className="px-4 py-2 text-sm uppercase"
                      style={{
                        background: params.riskLevel === r ? "#E31837" : "transparent",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setMcpConfig(JSON.stringify({ model: modelFile, ...params }, null, 2));
                setStep(3);
              }}
              className="mt-6 w-full py-4 font-semibold text-white uppercase tracking-wider flex items-center justify-center gap-2"
              style={{ background: "#E31837" }}
            >
              Generate Config <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 3: MCP Config */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-white mb-6">MCP Configuration</h2>
            <pre
              className="p-4 text-sm font-mono text-white/80 overflow-x-auto"
              style={{ background: "#0D0202", border: "1px solid rgba(227,24,55,0.2)" }}
            >
              {mcpConfig}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(mcpConfig || "")}
              className="mt-6 px-6 py-3 font-semibold text-white uppercase tracking-wider"
              style={{ background: "#4A0404", border: "1px solid rgba(227,24,55,0.2)" }}
            >
              Copy to Clipboard
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}