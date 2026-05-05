"use client";

import { useState, useEffect, useMemo } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, Idl } from "@coral-xyz/anchor";
import idlJson from "@/idl/gossip.json";

const PROGRAM_ID = new web3.PublicKey(
  "9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi"
);

export interface MarketData {
  mu: number;
  sigma: number;
  b: number;
  totalLiquidity: number;
  resolved: boolean;
  finalOutcome?: number;
  title: string;
}

const DEMO_DATA: Record<string, MarketData> = {
  "BTC-70k": {
    mu: 70000,
    sigma: 5000,
    b: 2,
    totalLiquidity: 500000000,
    resolved: false,
    title: "BTC-70k",
  },
  "SOL-200": {
    mu: 200,
    sigma: 30,
    b: 1.5,
    totalLiquidity: 250000000,
    resolved: false,
    title: "SOL-200",
  },
};

export function useMarketData(marketTitle: string) {
  const { connection } = useConnection();
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const program = useMemo(() => {
    if (!connection) return null;
    const provider = new AnchorProvider(
      connection,
      {} as any,
      { commitment: "confirmed" }
    );
    return new Program(idlJson as Idl, PROGRAM_ID, provider);
  }, [connection]);

  const fetchMarket = async () => {
    if (!program) {
      const demo = DEMO_DATA[marketTitle];
      if (demo) {
        setData(demo);
        setError("Using demo data");
      } else {
        setError("Demo data not available");
      }
      setLoading(false);
      return;
    }
    try {
      const [marketPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("market"), Buffer.from(marketTitle)],
        program.programId
      );
      const marketAccount = await program.account.market.fetch(marketPda);
      setData({
        mu: (marketAccount as any).mu,
        sigma: (marketAccount as any).sigma,
        b: (marketAccount as any).b,
        totalLiquidity: (marketAccount as any).totalLiquidity.toNumber(),
        resolved: (marketAccount as any).resolved,
        finalOutcome: (marketAccount as any).finalOutcome,
        title: (marketAccount as any).title,
      });
      setError(null);
    } catch (err) {
      const demo = DEMO_DATA[marketTitle];
      if (demo) {
        setData(demo);
        setError("Using demo data");
      } else {
        setError("Market not found");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 5000);
    return () => clearInterval(interval);
  }, [program, marketTitle]);

  return { data, loading, error, refetch: fetchMarket };
}