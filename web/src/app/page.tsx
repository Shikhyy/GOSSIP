"use client";

import { useState, useEffect, useMemo } from 'react';
import BellCurve from '@/components/BellCurve';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity, Users, ShieldCheck } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, Idl, BN } from '@coral-xyz/anchor';
import { Gossip } from '@/idl/gossip';
import IDL from '@/idl/gossip.json';

const PROGRAM_ID = new web3.PublicKey("9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi");
const MARKET_TITLE = "Will SOL hit 250 by Friday?";

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [mu, setMu] = useState(150);
  const [sigma, setSigma] = useState(25);
  const [liquidity, setLiquidity] = useState(42069);
  const [prediction, setPrediction] = useState<number | undefined>(undefined);
  const [betValue, setBetValue] = useState("180");

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
    
    // Set up an interval to poll for updates (simulating live agent bets)
    const interval = setInterval(fetchMarket, 5000);
    return () => clearInterval(interval);
  }, [program]);

  const handleBet = async () => {
    const val = parseFloat(betValue);
    if (isNaN(val)) return;
    
    setPrediction(val);
    
    if (!wallet.publicKey || !program) {
      // Simulate AMM tilt locally if not connected
      setMu(prev => prev + (val - prev) * 0.1);
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

      // Sending a real bet transaction
      await program.methods
        .placePrediction(val, new BN(10))
        .accounts({
          market: marketPda,
          prediction: predictionPda,
          user: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
        
      console.log("Prediction placed successfully!");
      // Re-fetch state
      const updatedMarket = await program.account.market.fetch(marketPda);
      setMu(updatedMarket.mu);
      setLiquidity(updatedMarket.totalLiquidity.toNumber());
    } catch (err) {
      console.error("Error placing prediction:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 p-8 font-sans">
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl italic shadow-lg shadow-violet-500/20">
            G
          </div>
          <h1 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            GOSSIP
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <Button variant="ghost" className="text-slate-400 hover:text-white">Leaderboard</Button>
          <Button variant="ghost" className="text-slate-400 hover:text-white">Agents</Button>
          <div className="wallet-button-container">
            <WalletMultiButton style={{
              backgroundColor: '#7c3aed',
              borderRadius: '9999px',
              padding: '0 1.5rem',
              fontWeight: 600,
            }} />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Stats */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl">
            <CardHeader className="border-b border-slate-800 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold mb-2">SOL Price Forecast</CardTitle>
                  <CardDescription className="text-slate-400">Predict the price of SOL on Friday, May 8, 2026</CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/20">
                  <Activity size={14} /> LIVE
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-3 gap-8 mb-8 text-center">
                <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                  <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-semibold">Mean Consensus</p>
                  <p className="text-2xl font-bold text-amber-400">${mu.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                  <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-semibold">Market Volatility</p>
                  <p className="text-2xl font-bold text-violet-400">{sigma.toFixed(2)}σ</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                  <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-semibold">Total Locked</p>
                  <p className="text-2xl font-bold text-indigo-400">42,069 CASH</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <BellCurve mu={mu} sigma={sigma} prediction={prediction} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                    <TrendingUp size={20} />
                  </div>
                  <CardTitle className="text-lg">Agent Alpha</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-4">LSTM Model V4 predicted current outcome with 94.2% accuracy.</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-500">GOSSIP-MCP-v1</span>
                  <Button variant="outline" size="sm" className="text-xs rounded-full border-slate-700 hover:bg-slate-800">Follow Agent</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                    <ShieldCheck size={20} />
                  </div>
                  <CardTitle className="text-lg">Verified Market</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-4">Secured by World ID and Arcium Confidential Compute.</p>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px]">AI</div>
                   ))}
                   <div className="w-8 h-8 rounded-full border-2 border-[#020617] bg-violet-600 flex items-center justify-center text-[10px]">+14</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trading Panel */}
        <Card className="bg-slate-900/80 border-slate-800 h-fit sticky top-8 shadow-2xl backdrop-blur-2xl">
          <CardHeader>
            <CardTitle>Place Prediction</CardTitle>
            <CardDescription>Continuous outcome betting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Prediction Point</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <Input 
                  type="number" 
                  value={betValue} 
                  onChange={(e) => setBetValue(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 pl-8 h-12 text-lg focus:ring-violet-500" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  <span>Bet Amount</span>
                  <span>Balance: 5,000 CASH</span>
               </div>
               <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-slate-800/30 border-slate-700 text-xs">10</Button>
                  <Button variant="outline" className="flex-1 bg-slate-800/30 border-slate-700 text-xs">100</Button>
                  <Button variant="outline" className="flex-1 bg-slate-800/30 border-slate-700 text-xs">MAX</Button>
               </div>
            </div>

            <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Current Density</span>
                <span className="text-slate-200">0.00142</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Implied Odds</span>
                <span className="text-slate-200">~14.5x</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-800 pt-2 font-bold">
                <span className="text-violet-400">Max Payout</span>
                <span className="text-white">100,000 CASH</span>
              </div>
            </div>

            <Button 
              onClick={handleBet}
              className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-violet-600/20 transition-all active:scale-95"
            >
              Confirm Bet
            </Button>
            
            <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest leading-relaxed">
              By confirming, you agree to market resolution via GOSSIP AI Judge Network.
            </p>
          </CardContent>
        </Card>
      </div>

      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 flex justify-between items-center text-slate-500 text-sm">
        <p>© 2026 GOSSIP Protocol. Built for Colosseum Frontier.</p>
        <div className="flex gap-6">
          <span>Docs</span>
          <span>Security</span>
          <span>Twitter</span>
        </div>
      </footer>
    </main>
  );
}
