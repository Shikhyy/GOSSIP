"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import BellCurve from "@/components/BellCurve";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Clock,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMarketData, useWalletBalance, useToast } from "@/hooks";
import TradingModal from "@/components/TradingModal";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, Idl, BN } from "@coral-xyz/anchor";
import { Gossip } from "@/idl/gossip";
import IDL from "@/idl/gossip.json";

const PROGRAM_ID = new web3.PublicKey(
  "9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi"
);
const MARKET_TITLE = "Will SOL hit 250 by Friday?";

const marketData: Record<string, { title: string; category: string }> = {
  "sol-price": { title: "Will SOL hit $250 by Friday?", category: "Crypto" },
  "btc-etf": { title: "BTC ETF Inflows Next Week ($M)", category: "Finance" },
  "nyc-temp": { title: "NYC Temperature on Dec 31 (°F)", category: "Weather" },
  "fed-rate": { title: "Fed Funds Rate Decision (%)", category: "Macro" },
  "eth-gas": { title: "ETH Average Gas Price (gwei)", category: "Crypto" },
  "ai-benchmark": { title: "GPT-5 MMLU Score (%)", category: "AI" },
};

export default function MarketDetailPage() {
  const params = useParams();
  const id = (params.id as string) || "sol-price";
  const marketInfo = marketData[id] || marketData["sol-price"];

  const { connection } = useConnection();
  const wallet = useWallet();
  const { showToast } = useToast();

  const { mu: hookMu = 198.42, sigma: hookSigma = 24.5, liquidity: hookLiquidity = 124500 } = useMarketData(id);
  const { balance = 5000 } = useWalletBalance();

  const [mu, setMu] = useState(hookMu);
  const [sigma, setSigma] = useState(hookSigma);
  const [liquidity, setLiquidity] = useState(hookLiquidity);
  
  // Mock Agent Sentiment Data
  const agentMu = useMemo(() => mu * (1 + (Math.random() - 0.5) * 0.1), [mu]);
  const agentSigma = useMemo(() => sigma * 0.8, [sigma]);

  const [prediction, setPrediction] = useState<number | undefined>(undefined);
  const [betValue, setBetValue] = useState("200");
  const [stakeAmount, setStakeAmount] = useState("10");
  const [isBetting, setIsBetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const program = useMemo(() => {
    if (!connection) return null;
    const provider = new AnchorProvider(
      connection,
      (wallet as any) || {
        publicKey: web3.PublicKey.default,
        signTransaction: async () => {},
        signAllTransactions: async () => {},
      },
      { commitment: "confirmed" }
    );
    return new Program(IDL as Idl, provider) as unknown as Program<Gossip>;
  }, [connection, wallet]);

  useEffect(() => {
    const fetchMarket = async () => {
      if (!program) return;
      try {
        const [marketPda] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from("market"), Buffer.from(MARKET_TITLE)],
          program.programId
        );
        const marketAccount = await program.account.market.fetch(marketPda);
        setMu(marketAccount.mu);
        setSigma(marketAccount.sigma);
        setLiquidity(marketAccount.totalLiquidity.toNumber());
        setError(null);
      } catch (err) {
        setError("Using demo data — program connection unavailable");
      }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 5000);
    return () => clearInterval(interval);
  }, [program]);

  const handleBet = async () => {
    const val = parseFloat(betValue);
    if (isNaN(val)) return;

    setIsBetting(true);
    setPrediction(val);

    if (!wallet.publicKey || !program) {
      setTimeout(() => {
        setMu((prev) => prev + (val - prev) * 0.05);
        setLiquidity((prev) => prev + parseFloat(stakeAmount || "10"));
        setIsBetting(false);
        showToast("Prediction placed successfully!", "success");
      }, 1200);
      return;
    }

    try {
      const [marketPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("market"), Buffer.from(MARKET_TITLE)],
        program.programId
      );
      
      const marketState = await program.account.market.fetch(marketPda);
      const mint = marketState.mint as web3.PublicKey;
      
      const [vaultPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), Buffer.from(MARKET_TITLE)],
        program.programId
      );

      // Use timestamp as a unique prediction ID
      const predictionId = new BN(Date.now());

      const [predictionPda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("prediction"),
          marketPda.toBuffer(),
          wallet.publicKey.toBuffer(),
          predictionId.toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );

      // Get user's associated token account
      const { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
      const userTokenAccount = getAssociatedTokenAddressSync(mint, wallet.publicKey);

      await program.methods
        .placePrediction(predictionId, val, new BN(parseFloat(stakeAmount) * 1e6)) // Adjusted for USDC/CASH 6 decimals
        .accounts({
          market: marketPda,
          prediction: predictionPda,
          user: wallet.publicKey,
          userTokenAccount: userTokenAccount,
          vault: vaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        } as any)
        .rpc();

      const updatedMarket = await program.account.market.fetch(marketPda);
      setMu(updatedMarket.mu);
      setLiquidity(updatedMarket.totalLiquidity.toNumber());
      setError(null);
      showToast("Prediction placed successfully!", "success");
    } catch (err) {
      setError("Transaction failed. Please try again.");
      showToast("Failed to place prediction. Please try again.", "error");
    } finally {
      setIsBetting(false);
    }
  };

  const impliedMultiplier = useMemo(() => {
    if (!prediction) return 0;
    const density =
      (1 / (sigma * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((prediction - mu) / sigma, 2));
    return (density * 100000).toFixed(1);
  }, [mu, sigma, prediction]);

  const potentialPayout = useMemo(() => {
    const stake = parseFloat(stakeAmount || "10");
    return (stake * parseFloat(impliedMultiplier || "0")).toFixed(2);
  }, [stakeAmount, impliedMultiplier]);

  return (
    <div className="min-h-screen px-4 pb-20">
      <div className="max-w-7xl mx-auto pt-6">
        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="mb-6">
          <Link href="/markets" className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors" style={{ color: "#999999" }}>
            <ArrowLeft className="w-4 h-4" /> Back to Markets
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px]" style={{ background: "#E31837" }} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#C25B5B" }}>{marketInfo.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{marketInfo.title}</h1>
          <p className="max-w-2xl" style={{ color: "#999999" }}>
            Predict the exact outcome upon resolution. This continuous distribution market uses Gaussian AMM with LMSR pricing.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.1 }} 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Market Mean (μ)", value: mu.toFixed(2), detail: "Consensus" },
            { label: "Std Deviation (σ)", value: sigma.toFixed(2), detail: "Volatility" },
            { label: "Liquidity Locked", value: `${(liquidity / 1e6).toFixed(2)}M`, detail: "CASH" },
            { label: "Active Yield", value: "12.4%", detail: "Reflect rCASH" },
          ].map((stat, i) => (
            <div key={stat.label} className="p-6 relative overflow-hidden group" style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.15)" }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-red-500/10 transition-colors" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "#666" }}>{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/60">{stat.detail}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column: Chart & Insights */}
          <div className="lg:col-span-2 space-y-3">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="p-6 sm:p-8" style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Market Distribution</h2>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#999999" }}>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2" style={{ background: "#E31837" }} /> Human Consensus</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2" style={{ background: "#3B82F6" }} /> Agent Consensus</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2" style={{ background: "#22C55E" }} /> Your Bet</span>
                </div>
              </div>
              <div className="w-full h-[350px] sm:h-[400px]">
                <BellCurve mu={mu} sigma={sigma} prediction={prediction} agentMu={agentMu} agentSigma={agentSigma} />
              </div>
            </motion.div>

            {/* AI Insights Block */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="p-6" style={{ background: "rgba(59, 130, 246, 0.03)", border: "1px solid rgba(59, 130, 246, 0.15)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-blue-400" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">GOSSIP AI: Market Reasoning</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed italic">
                "Consensus model indicates a high-probability divergence in {marketInfo.category} sentiment. 
                Agents are currently weighting the 'Long Tail' outcomes 14% higher than historical human norms 
                due to live social trends on X regarding {marketInfo.title.split(' ')[1]} infrastructure."
              </p>
            </motion.div>
          </div>

          {/* Trading Panel */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="p-8 flex flex-col" style={{ background: "#0D0202", border: "1px solid rgba(227,24,55,0.25)" }}>
            <div className="flex items-center gap-2 mb-8">
              <Zap className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Execution Terminal</h2>
            </div>

            {error && (
              <div className="mb-6 p-4 text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", color: "#EAB308" }}>{error}</div>
            )}

            {/* AI Sentiment Signal */}
            <div className="mb-8 p-4 bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">AI Sentiment Signal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Processing...</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-white mb-1 uppercase tracking-tight">
                    Agents are {agentMu > mu ? "Higher" : "Lower"}
                  </p>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
                    {(Math.abs(agentMu - mu) / mu * 100).toFixed(2)}% deviation from human consensus
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${agentMu > mu ? "text-green-400" : "text-red-400"} uppercase italic tracking-tighter`}>
                    {agentMu > mu ? "OVERWEIGHT" : "UNDERWEIGHT"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: "#666" }}>Prediction Target</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors pointer-events-none" />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-mono text-red-500/50">$</span>
                  <input type="number" value={betValue} onChange={(e) => setBetValue(e.target.value)} className="w-full pl-10 pr-4 py-5 text-2xl font-black text-white focus:outline-none transition-all" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#666" }}>Stake Amount</label>
                  <span className="text-[10px] font-mono font-bold" style={{ color: "#444" }}>BAL: 5,000 CASH</span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors pointer-events-none" />
                  <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} className="w-full px-5 py-5 text-2xl font-black text-white focus:outline-none transition-all" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)" }} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <button className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>MAX</button>
                  </div>
                </div>
              </div>

              {/* Calculations */}
              <div className="p-6 space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Implied Odds</span>
                  <span className="font-mono text-sm font-bold text-white">{impliedMultiplier ? `${impliedMultiplier}x` : "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Protocol Fee</span>
                  <span className="font-mono text-sm font-bold text-white">0.5%</span>
                </div>
                <div className="pt-4 flex justify-between items-end" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] block mb-1 text-red-500">Max Payout</span>
                    <span className="font-mono text-3xl font-black text-white leading-none">{potentialPayout}</span>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-600 mb-1">CASH</span>
                </div>
              </div>

              <button onClick={() => setShowModal(true)} disabled={isBetting} className="w-full py-6 font-black text-white uppercase tracking-[0.3em] text-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 flex justify-center items-center gap-3 shadow-[0_0_30px_rgba(227,24,55,0.2)]" style={{ background: "#E31837" }}>
                {isBetting ? <><Activity className="w-4 h-4 animate-spin" /> Transacting...</> : <>Lock Position <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Market Details */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="mt-3 p-6 sm:p-8" style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}>
          <h3 className="text-lg font-semibold text-white mb-6 uppercase tracking-wide">Market Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            {[
              { label: "Resolution Source", value: "AI Judge Committee" },
              { label: "Resolution Date", value: "May 8, 2026, 12:00 PM UTC" },
              { label: "Settlement Token", value: "Phantom CASH" },
              { label: "Automated Trading", value: "Enabled (MCP Available)" },
              { label: "LMSR Parameter (b)", value: "1,000" },
              { label: "Fee Structure", value: "0.5% Protocol + 0.1% Creator" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="text-sm" style={{ color: "#999999" }}>{item.label}</span>
                <span className="text-sm font-medium text-white flex items-center gap-1.5">
                  {item.value}
                  {item.label === "Resolution Source" && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {showModal && (
          <TradingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={handleBet}
            prediction={parseFloat(betValue)}
            stake={parseFloat(stakeAmount)}
            multiplier={String(impliedMultiplier)}
            potentialPayout={potentialPayout}
            balance={balance}
          />
        )}
      </div>
    </div>
  );
}
