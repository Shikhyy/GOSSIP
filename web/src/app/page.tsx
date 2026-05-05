"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BellCurve from '@/components/BellCurve';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity, Users, ShieldCheck, Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, Idl, BN } from '@coral-xyz/anchor';
import { Gossip } from '@/idl/gossip';
import IDL from '@/idl/gossip.json';

const PROGRAM_ID = new web3.PublicKey("9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi");
const MARKET_TITLE = "Will SOL hit 250 by Friday?";

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } }
};

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [mu, setMu] = useState(150);
  const [sigma, setSigma] = useState(25);
  const [liquidity, setLiquidity] = useState(42069);
  const [prediction, setPrediction] = useState<number | undefined>(undefined);
  const [betValue, setBetValue] = useState("180");
  const [isBetting, setIsBetting] = useState(false);

  const program = useMemo(() => {
    if (!connection) return null;
    const provider = new AnchorProvider(
      connection, 
      wallet as any || { publicKey: web3.PublicKey.default, signTransaction: async () => {}, signAllTransactions: async () => {} }, 
      { commitment: 'confirmed' }
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
      } catch (err) {
        console.log("Market not found or error fetching. Using defaults.", err);
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
        setMu(prev => prev + (val - prev) * 0.1);
        setIsBetting(false);
      }, 1000);
      return;
    }

    try {
      const [marketPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("market"), Buffer.from(MARKET_TITLE)],
        program.programId
      );
      const [predictionPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("prediction"), marketPda.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .placePrediction(val, new BN(10))
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
    } catch (err) {
      console.error("Error placing prediction:", err);
    } finally {
      setIsBetting(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent text-slate-50 font-sans relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-grid z-[-1] opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#02020a]/80 to-[#02020a] z-[-1]" />
      
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full border-b border-white/10 glass-panel sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              G
            </div>
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              GOSSIP
            </h1>
          </div>
          <div className="flex gap-6 items-center">
            <Button variant="ghost" className="text-sm font-medium text-slate-300 hover:text-white hidden md:flex">Markets</Button>
            <Button variant="ghost" className="text-sm font-medium text-slate-300 hover:text-white hidden md:flex">AI Agents</Button>
            <div className="wallet-button-container hover:scale-105 transition-transform">
              <WalletMultiButton style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '0 1.25rem',
                fontWeight: 600,
                color: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }} />
            </div>
          </div>
        </div>
      </motion.nav>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column: Market Data & Visualization */}
        <div className="lg:col-span-2 space-y-8">
          
          <motion.div variants={slideUp}>
            <Card className="glass-card overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 opacity-50" />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-widest uppercase mb-4"
                    >
                      <BrainCircuit size={14} /> AI vs Human Arena
                    </motion.div>
                    <CardTitle className="text-4xl md:text-5xl font-black mb-3 tracking-tight">{MARKET_TITLE}</CardTitle>
                    <CardDescription className="text-slate-400 text-base max-w-xl">
                      Trade probability density on a continuous curve. The further from consensus, the closer to infinite upside.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)] animate-pulse">
                    <Activity size={16} /> LIVE
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-slate-400 text-xs mb-1 uppercase tracking-widest font-semibold">Mean Consensus</p>
                    <p className="text-3xl font-black text-white">${mu.toFixed(2)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-slate-400 text-xs mb-1 uppercase tracking-widest font-semibold">Market Volatility</p>
                    <p className="text-3xl font-black text-white">{sigma.toFixed(2)}σ</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-slate-400 text-xs mb-1 uppercase tracking-widest font-semibold">Total Liquidity</p>
                    <p className="text-3xl font-black text-white">{liquidity.toLocaleString()} CASH</p>
                  </div>
                </div>
                
                <div className="relative group rounded-xl p-1 bg-gradient-to-b from-white/10 to-transparent">
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <BellCurve mu={mu} sigma={sigma} prediction={prediction} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card group cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-violet-500/20 rounded-xl text-violet-400 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                    <TrendingUp size={22} />
                  </div>
                  <CardTitle className="text-lg">Agent Alpha (LSTM)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-5 leading-relaxed">This autonomous model predicted the current outcome with 94.2% accuracy. Powered by GOSSIP MCP.</p>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-xs font-mono text-slate-500 bg-black/30 px-2 py-1 rounded">gossip-mcp-v1</span>
                  <Button variant="ghost" className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 text-xs gap-1">
                    Copy Trade <ArrowRight size={14}/>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    <ShieldCheck size={22} />
                  </div>
                  <CardTitle className="text-lg">Verified Execution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-5 leading-relaxed">Oracle resolution secured by Arcium Confidential Compute. Sybil resistance via World ID.</p>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                   <div className="flex -space-x-3">
                     {[1,2,3].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-[10px] font-bold text-white/70 shadow-lg">AI</div>
                     ))}
                     <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">+14</div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Active Judges</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Trading Panel */}
        <motion.div variants={slideUp}>
          <Card className="glass-panel h-fit sticky top-24 shadow-[0_0_40px_rgba(0,0,0,0.5)] border-t-white/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="text-amber-400" size={24} />
                  Place Bet
                </CardTitle>
              </div>
              <CardDescription className="text-slate-400">Position yourself against the AI consensus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Target Prediction ($)</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
                  <div className="relative flex items-center bg-black/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-violet-500/50 transition-colors">
                    <span className="pl-4 text-slate-500 font-bold">$</span>
                    <Input 
                      type="number" 
                      value={betValue} 
                      onChange={(e) => setBetValue(e.target.value)}
                      className="bg-transparent border-none text-2xl font-black text-white focus-visible:ring-0 focus-visible:ring-offset-0 h-16 pl-2" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Stake Size</span>
                    <span className="text-violet-400">Bal: 5,000 CASH</span>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 h-12 text-sm font-bold transition-all">10</Button>
                    <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 h-12 text-sm font-bold transition-all">100</Button>
                    <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 h-12 text-sm font-bold text-amber-400 transition-all">MAX</Button>
                 </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 space-y-3 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Density Score</span>
                  <span className="text-sm font-mono text-white">0.00142</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Implied Odds</span>
                  <span className="text-sm font-mono text-green-400">~14.5x</span>
                </div>
                <div className="h-px w-full bg-white/10 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-violet-300 font-bold uppercase tracking-wider">Max Payout</span>
                  <span className="text-lg font-black text-white shadow-white drop-shadow-md">100,000 CASH</span>
                </div>
              </div>

              <Button 
                onClick={handleBet}
                disabled={isBetting}
                className="relative w-full h-16 overflow-hidden rounded-2xl group border-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_auto] animate-gradient" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <span className="relative text-white font-black text-lg tracking-wider flex items-center gap-2">
                  {isBetting ? "PROCESSING..." : "CONFIRM PREDICTION"} 
                  {!isBetting && <ArrowRight size={20} />}
                </span>
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                <ShieldCheck size={12} />
                <span>Smart Contract Audited</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </main>
  );
}
