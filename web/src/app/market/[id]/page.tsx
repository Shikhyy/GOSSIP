"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, BN, Idl, Program, web3 } from "@coral-xyz/anchor";
import { Activity, ArrowLeft, ArrowRight, Bot, Info, ShieldCheck, Sparkles, Zap } from "lucide-react";
import BellCurve from "@/components/BellCurve";
import TradingModal from "@/components/TradingModal";
import { useMarketData, useToast, useWalletBalance } from "@/hooks";
import { Gossip } from "@/idl/gossip";
import IDL from "@/idl/gossip.json";
import { formatCompactCurrency, formatPercent, getMarketById } from "@/lib/demo-data";

const MARKET_TITLE = "Will SOL hit 250 by Friday?";

interface MarketAccount {
  mu: number;
  sigma: number;
  totalLiquidity: BN;
  mint: web3.PublicKey;
}

interface RpcMethodBuilder {
  accounts(accounts: Record<string, unknown>): {
    rpc(): Promise<string>;
  };
}

export default function MarketDetailPage() {
  const params = useParams();
  const id = (params.id as string) || "sol-price";
  const meta = getMarketById(id);

  const { mu: hookMu, sigma: hookSigma, liquidity: hookLiquidity, error: hookError } = useMarketData(id);
  const { balance } = useWalletBalance();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { showToast } = useToast();

  const [mu, setMu] = useState(hookMu);
  const [sigma, setSigma] = useState(hookSigma);
  const [liquidity, setLiquidity] = useState(hookLiquidity);
  const [betValue, setBetValue] = useState(String(meta.consensus));
  const [stakeAmount, setStakeAmount] = useState("50");
  const [prediction, setPrediction] = useState<number | undefined>(undefined);
  const [ticketError, setTicketError] = useState<string | null>(hookError);
  const [isBetting, setIsBetting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => setMu(hookMu), [hookMu]);
  useEffect(() => setSigma(hookSigma), [hookSigma]);
  useEffect(() => setLiquidity(hookLiquidity), [hookLiquidity]);
  useEffect(() => setTicketError(hookError), [hookError]);

  const program = useMemo(() => {
    if (!connection) return null;
    const provider = new AnchorProvider(
      connection,
      wallet as unknown as AnchorProvider["wallet"],
      { commitment: "confirmed" }
    );
    return new Program(IDL as Idl, provider) as unknown as Program<Gossip>;
  }, [connection, wallet]);

  useEffect(() => {
    if (!program) return;

    const syncMarket = async () => {
      try {
        const [marketPda] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from("market"), Buffer.from(MARKET_TITLE)],
          program.programId
        );
        const account = await program.account.market.fetch(marketPda) as MarketAccount;
        setMu(account.mu);
        setSigma(account.sigma);
        setLiquidity(account.totalLiquidity.toNumber());
        setTicketError(null);
      } catch {
        setTicketError("Using demo market state while the onchain market is unavailable.");
      }
    };

    const timeoutId = window.setTimeout(() => void syncMarket(), 0);
    const intervalId = window.setInterval(() => void syncMarket(), 7000);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [program]);

  const bias = useMemo(() => {
    const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ((hash % 9) - 4) / 100;
  }, [id]);
  const agentMu = useMemo(() => mu * (1 + bias), [bias, mu]);
  const agentSigma = useMemo(() => sigma * 0.82, [sigma]);

  const parsedPrediction = useMemo(() => parseFloat(betValue), [betValue]);
  const parsedStake = useMemo(() => parseFloat(stakeAmount), [stakeAmount]);

  const impliedMultiplier = useMemo(() => {
    if (!Number.isFinite(parsedPrediction)) return 0;
    const density =
      (1 / (sigma * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((parsedPrediction - mu) / sigma, 2));
    return Number((density * 100000).toFixed(1));
  }, [mu, parsedPrediction, sigma]);

  const potentialPayout = useMemo(() => {
    if (!Number.isFinite(parsedStake)) return "0.00";
    return (parsedStake * impliedMultiplier).toFixed(2);
  }, [impliedMultiplier, parsedStake]);

  const handleBet = async () => {
    if (!Number.isFinite(parsedPrediction) || !Number.isFinite(parsedStake)) {
      setTicketError("Enter a valid target and stake.");
      return;
    }

    setPrediction(parsedPrediction);
    setIsBetting(true);
    setTicketError(null);

    if (!wallet.publicKey || !program) {
      window.setTimeout(() => {
        setMu((current) => current + (parsedPrediction - current) * 0.04);
        setLiquidity((current) => current + parsedStake);
        setIsBetting(false);
        showToast("success", "Demo position submitted.");
      }, 900);
      return;
    }

    try {
      const [marketPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("market"), Buffer.from(MARKET_TITLE)],
        program.programId
      );

      const marketState = await program.account.market.fetch(marketPda) as MarketAccount;
      const [vaultPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), Buffer.from(MARKET_TITLE)],
        program.programId
      );
      const predictionId = new BN(Date.now());
      const [predictionPda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("prediction"),
          marketPda.toBuffer(),
          wallet.publicKey.toBuffer(),
          predictionId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );
      const { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
      const userTokenAccount = getAssociatedTokenAddressSync(marketState.mint, wallet.publicKey);

      const placePrediction = program.methods.placePrediction(
        predictionId,
        parsedPrediction,
        new BN(parsedStake * 1e6)
      ) as unknown as RpcMethodBuilder;

      await placePrediction
        .accounts({
          market: marketPda,
          prediction: predictionPda,
          user: wallet.publicKey,
          userTokenAccount,
          vault: vaultPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      const updated = await program.account.market.fetch(marketPda) as MarketAccount;
      setMu(updated.mu);
      setLiquidity(updated.totalLiquidity.toNumber());
      showToast("success", "Onchain position submitted.");
    } catch {
      setTicketError("Transaction failed. Check wallet approvals and try again.");
      showToast("error", "Failed to place prediction.");
    } finally {
      setIsBetting(false);
    }
  };

  return (
    <div className="px-4 pb-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <Link href="/markets" className="inline-flex items-center gap-2 text-sm text-[#8fa4c2] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to markets
          </Link>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="surface-strong rounded-[28px] p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill pill-positive">{meta.status}</span>
              <span className="pill">{meta.category}</span>
              <span className="pill">
                <ShieldCheck className="h-3.5 w-3.5 text-[#4da3ff]" />
                {meta.resolutionSource}
              </span>
            </div>
            <h1 className="mt-5 text-4xl font-semibold text-white">{meta.title}</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#9cb0ca]">{meta.subtitle}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              {[
                { label: "Consensus", value: `${meta.unit}${mu.toFixed(2)}`, detail: meta.outcomeLabel },
                { label: "24h change", value: formatPercent(meta.change24h), detail: "Versus prior session" },
                { label: "Open liquidity", value: formatCompactCurrency(liquidity), detail: "Market depth" },
                { label: "Resolution", value: meta.resolutionLabel, detail: meta.resolutionSource },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="metric-label">{stat.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-xs text-[#8fa4c2]">{stat.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="surface rounded-[28px] p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Agent skew</p>
                <h2 className="section-title mt-2">Machine consensus</h2>
              </div>
              <Bot className="h-5 w-5 text-[#4da3ff]" />
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-[#091523] p-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="metric-label">Agent fair value</p>
                  <p className="text-3xl font-semibold text-white">
                    {meta.unit}
                    {agentMu.toFixed(2)}
                  </p>
                </div>
                <span className={`pill ${agentMu >= mu ? "pill-positive" : "pill-negative"}`}>
                  {agentMu >= mu ? "Above crowd" : "Below crowd"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                  <p className="metric-label">Deviation</p>
                  <p className="mt-1 text-lg font-semibold text-white">{formatPercent(((agentMu - mu) / mu) * 100, 2)}</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                  <p className="metric-label">Agent sigma</p>
                  <p className="mt-1 text-lg font-semibold text-white">{agentSigma.toFixed(2)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#8fa4c2]">
                Agent models are {agentMu >= mu ? "pricing a stronger upside scenario" : "more conservative than the crowd"}.
                Use this panel to compare discretionary conviction against machine flow before sending the order.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-[#8fa4c2]">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-[#ffb547]" />
                <p>
                  {ticketError ?? "Live wallet mode will use the Solana program. If that path is unavailable, the UI falls back to demo market state so the experience stays testable."}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="surface rounded-[28px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-kicker">Distribution</p>
                <h2 className="section-title mt-2">Human vs agent pricing</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="pill"><span className="h-2 w-2 rounded-full bg-[#19c37d]" /> Your target</span>
                <span className="pill"><span className="h-2 w-2 rounded-full bg-[#4da3ff]" /> Agent mean</span>
                <span className="pill"><span className="h-2 w-2 rounded-full bg-[#19c37d]" /> Human mean</span>
              </div>
            </div>
            <div className="mt-6 h-[390px]">
              <BellCurve
                mu={mu}
                sigma={sigma}
                prediction={prediction}
                agentMu={agentMu}
                agentSigma={agentSigma}
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="surface rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Execution ticket</p>
                <h2 className="section-title mt-2">Place a position</h2>
              </div>
              <Zap className="h-5 w-5 text-[#19c37d]" />
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="metric-label">Prediction target</label>
                <div className="relative mt-2">
                  {meta.unit && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8fa4c2]">
                      {meta.unit}
                    </span>
                  )}
                  <input
                    type="number"
                    value={betValue}
                    onChange={(event) => setBetValue(event.target.value)}
                    className={`trading-input ${meta.unit ? "pl-8" : ""}`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="metric-label">Stake amount</label>
                  <span className="text-xs text-[#8fa4c2]">Balance: {balance.toLocaleString()} CASH</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(event) => setStakeAmount(event.target.value)}
                    className="trading-input"
                  />
                  <button
                    onClick={() => setStakeAmount(String(balance))}
                    className="rounded-xl border border-white/10 bg-white/4 px-4 text-sm font-medium text-white"
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#091523] p-5">
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#8fa4c2]">Implied multiplier</span>
                  <span className="font-mono text-white">{impliedMultiplier.toFixed(1)}x</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#8fa4c2]">Protocol fee</span>
                  <span className="font-mono text-white">0.5%</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/8 pt-4 text-sm">
                  <span className="text-[#8fa4c2]">Potential payout</span>
                  <span className="font-mono text-xl font-semibold text-white">{potentialPayout} CASH</span>
                </div>
              </div>

              {ticketError && (
                <div className="rounded-2xl border border-[#ffb547]/25 bg-[#ffb547]/8 px-4 py-3 text-sm text-[#ffd494]">
                  {ticketError}
                </div>
              )}

              <button
                onClick={() => setShowModal(true)}
                disabled={isBetting}
                className="trading-button trading-button-primary w-full px-4 py-3 disabled:opacity-60"
              >
                {isBetting ? (
                  <>
                    <Activity className="h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : (
                  <>
                    Review position
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Resolution",
              body: meta.resolutionSource,
              detail: meta.resolutionLabel,
            },
            {
              title: "Why this market",
              body: "Continuous contracts let you trade exact values instead of only yes/no outcomes.",
              detail: `${meta.participation} active participants`,
            },
            {
              title: "Agentic edge",
              body: "Deployers can pipe models into the agent surface and compare flow against discretionary tickets.",
              detail: "Deploy path available from the Agents tab",
            },
          ].map((card) => (
            <div key={card.title} className="surface rounded-[24px] p-5">
              <p className="section-kicker">{card.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-white">{card.body}</p>
              <p className="mt-3 text-xs text-[#8fa4c2]">{card.detail}</p>
            </div>
          ))}
        </section>

        {showModal && (
          <TradingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={handleBet}
            prediction={Number.isFinite(parsedPrediction) ? parsedPrediction : meta.consensus}
            stake={Number.isFinite(parsedStake) ? parsedStake : 0}
            multiplier={impliedMultiplier.toFixed(1)}
            potentialPayout={potentialPayout}
            balance={balance}
          />
        )}
      </div>
    </div>
  );
}
