"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { markets, MarketRecord } from '@/lib/demo-data';

export type Market = MarketRecord;

export function useMarketsWithFallback() {
  const { connected } = useWallet();
  const [useOnChain, setUseOnChain] = useState(false);
  const [marketsData, setMarketsData] = useState<Market[]>(markets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demo: use on-chain data when wallet is connected
  // In production, check RPC health and use real data
  useEffect(() => {
    if (connected) {
      setUseOnChain(true);
      // TODO: Fetch real markets from on-chain
      // For now, keep demo data but indicate live mode
    } else {
      setUseOnChain(false);
      setMarketsData(markets);
    }
  }, [connected]);

  // Real implementation would call getProgram().account.market.all()
  const fetchOnChainMarkets = async () => {
    try {
      setLoading(true);
      // const program = getProgram();
      // const allMarkets = await program.account.market.all();
      // Transform and return
      setMarketsData(markets); // Fallback to demo
    } catch (err) {
      console.error('Failed to fetch on-chain markets:', err);
      setError('Using demo data');
      setMarketsData(markets);
    } finally {
      setLoading(false);
    }
  };

  return {
    markets: marketsData,
    loading,
    error,
    isOnChain: useOnChain,
    refetch: fetchOnChainMarkets,
  };
}