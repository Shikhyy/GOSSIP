"use client";

import { useState, useEffect, useCallback } from 'react';
import { getMarketById } from '@/lib/demo-data';

export interface MarketData {
  title: string;
  category: string;
  mu: number;
  sigma: number;
  b: number;
  totalLiquidity: number;
  resolved: boolean;
  finalOutcome: number;
  resolutionSource: string;
  endsAt: number;
  oracleAuthority: string;
  feeBps: number;
  paused: boolean;
}

export function useMarket(title: string) {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarket = useCallback(async () => {
    if (!title) return;
    
    try {
      setLoading(true);
      
      // Use demo data for now - on-chain integration would be done later
      const demoMarket = getMarketById(title);
      
      setMarket({
        title: demoMarket.title,
        category: demoMarket.category,
        mu: demoMarket.consensus,
        sigma: demoMarket.sigma,
        b: 100,
        totalLiquidity: demoMarket.liquidity,
        resolved: demoMarket.status === 'resolving',
        finalOutcome: 0,
        resolutionSource: demoMarket.resolutionSource,
        endsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        oracleAuthority: '',
        feeBps: 250,
        paused: false,
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch market:', err);
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, [title]);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  return { market, loading, error, refetch: fetchMarket };
}