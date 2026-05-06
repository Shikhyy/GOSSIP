"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, Idl } from "@coral-xyz/anchor";
import idlJson from "@/idl/gossip.json";
import { Gossip } from "@/idl/gossip";

export interface MarketData {
  mu: number;
  sigma: number;
  b: number;
  totalLiquidity: number;
  resolved: boolean;
  finalOutcome?: number;
  title: string;
}

interface RawMarketAccount {
  mu: number;
  sigma: number;
  b: number;
  totalLiquidity: { toNumber(): number };
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
      {} as AnchorProvider["wallet"],
      { commitment: "confirmed" }
    );
    return new Program(idlJson as Idl, provider) as unknown as Program<Gossip>;
  }, [connection]);

  const fetchMarket = useCallback(async () => {
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
      const marketAccount = await program.account.market.fetch(
        marketPda
      ) as RawMarketAccount;
      setData({
        mu: marketAccount.mu,
        sigma: marketAccount.sigma,
        b: marketAccount.b,
        totalLiquidity: marketAccount.totalLiquidity.toNumber(),
        resolved: marketAccount.resolved,
        finalOutcome: marketAccount.finalOutcome,
        title: marketAccount.title,
      });
      setError(null);
    } catch {
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
  }, [marketTitle, program]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchMarket();
    }, 0);
    const interval = setInterval(fetchMarket, 5000);
    return () => {
      window.clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [fetchMarket]);

  return { data, loading, error, refetch: fetchMarket };
}
