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
      const [predictionPda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("prediction"),
          marketPda.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .placePrediction(val, new BN(parseFloat(stakeAmount) * 1e9))
        .accounts({
          market: marketPda,
          prediction: predictionPda,
          user: wallet.publicKey,
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Consensus (μ)", value: `$${mu.toFixed(2)}` },
            { label: "Volatility (σ)", value: sigma.toFixed(2) },
            { label: "Liquidity Locked", value: `${liquidity.toLocaleString()} CASH` },
            { label: "Participants", value: "1,247" },
          ].map((stat, i) => (
            <div key={stat.label} className="p-4" style={{ background: i === 1 ? "#4A0404" : "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#999999" }}>{stat.label}</p>
              <p className="text-xl font-semibold font-mono text-white">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Chart */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="lg:col-span-2 p-6 sm:p-8" style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Market Distribution</h2>
              <div className="flex items-center gap-4 text-xs" style={{ color: "#999999" }}>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5" style={{ background: "#E31837" }} /> Consensus</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5" style={{ background: "#22C55E" }} /> Your Bet</span>
              </div>
            </div>
            <div className="w-full h-[350px] sm:h-[400px]">
              <BellCurve mu={mu} sigma={sigma} prediction={prediction} />
            </div>
          </motion.div>

          {/* Trading Panel */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="p-6" style={{ background: "#4A0404", border: "1px solid rgba(227,24,55,0.2)" }}>
            <h2 className="text-lg font-semibold text-white mb-6 uppercase tracking-wide">Place Prediction</h2>

            {error && (
              <div className="mb-4 p-3 text-sm" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", color: "#EAB308" }}>{error}</div>
            )}

            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: "#C25B5B" }}>Prediction Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono" style={{ color: "#999999" }}>$</span>
                  <input type="number" value={betValue} onChange={(e) => setBetValue(e.target.value)} className="w-full pl-8 pr-4 py-3.5 text-lg font-mono text-white focus:outline-none transition-all" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(227,24,55,0.2)" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "#C25B5B" }}>Stake Amount</label>
                  <span className="text-xs font-mono" style={{ color: "#999999" }}>Bal: 5,000 CASH</span>
                </div>
                <div className="relative">
                  <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} className="w-full px-4 py-3.5 text-lg font-mono text-white focus:outline-none transition-all" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(227,24,55,0.2)" }} />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>MIN</button>
                    <button className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>MAX</button>
                  </div>
                </div>
              </div>

              {/* Calculations */}
              <div className="p-4 space-y-3" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(227,24,55,0.1)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#999999" }}>Probability Density</span>
                  <span className="font-mono text-white">{prediction ? ((1/(sigma*Math.sqrt(2*Math.PI)))*Math.exp(-0.5*Math.pow((prediction-mu)/sigma,2))).toExponential(4) : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#999999" }}>Implied Multiplier</span>
                  <span className="font-mono" style={{ color: "#22C55E" }}>{impliedMultiplier ? `${impliedMultiplier}x` : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#999999" }}>Network Fee</span>
                  <span className="font-mono text-white">0.000005 SOL</span>
                </div>
                <div className="pt-3 flex justify-between items-center" style={{ borderTop: "1px solid rgba(227,24,55,0.15)" }}>
                  <span className="font-semibold text-white">Potential Payout</span>
                  <span className="font-mono font-bold text-lg text-white">{potentialPayout} CASH</span>
                </div>
              </div>

              <button onClick={handleBet} disabled={isBetting} className="w-full py-4 font-semibold text-white uppercase tracking-wider text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2" style={{ background: "#E31837" }}>
                {isBetting ? <span className="flex items-center gap-2"><Activity className="w-4 h-4 animate-spin" /> EXECUTING...</span> : "PLACE PREDICTION"}
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
