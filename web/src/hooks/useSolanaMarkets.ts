"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchAllMarkets, fetchMarketByTitle, OnChainMarket, connection, PROGRAM_ID } from '@/lib/solana-data';
import { useWallet } from '@solana/wallet-adapter-react';

export interface Market {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status: "live" | "resolving" | "upcoming";
  consensus: number;
  sigma: number;
  liquidity: number;
  volume24h: number;
  change24h: number;
  participation: number;
  resolutionLabel: string;
  resolutionSource: string;
  unit: string;
  outcomeLabel: string;
  featured?: boolean;
  agentBias?: "bullish" | "bearish" | "neutral";
}

export function useSolanaMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnChain, setIsOnChain] = useState(false);
  const { connected } = useWallet();

  const loadMarkets = useCallback(async () => {
    try {
      setLoading(true);
      const onChainMarkets = await fetchAllMarkets();
      
      if (onChainMarkets.length > 0) {
        setIsOnChain(true);
        // Transform on-chain data to frontend format
        setMarkets(onChainMarkets.map(transformMarket));
      } else {
        // Generate dynamic fallback based on time
        setIsOnChain(false);
        setMarkets(generateDynamicMarkets());
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load markets:', err);
      setError('Using fallback data');
      setMarkets(generateDynamicMarkets());
      setIsOnChain(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarkets();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadMarkets, 30000);
    return () => clearInterval(interval);
  }, [loadMarkets]);

  return { markets, loading, error, isOnChain, refetch: loadMarkets, connected };
}

export function useMarketData(marketId: string) {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarket = async () => {
      try {
        setLoading(true);
        const onChainMarket = await fetchMarketByTitle(marketId);
        
        if (onChainMarket) {
          setMarket(transformMarket(onChainMarket));
        } else {
          // Try to find in dynamic markets
          const dynamic = generateDynamicMarkets().find(m => m.id === marketId);
          setMarket(dynamic || null);
        }
      } catch (err) {
        console.error('Failed to load market:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadMarket();
  }, [marketId]);

  return { market, loading };
}

// Transform on-chain market to frontend format
function transformMarket(m: OnChainMarket): Market {
  const now = Date.now() / 1000;
  const status = m.resolved ? 'resolving' : m.endsAt > now ? 'live' : 'upcoming';
  
  return {
    id: m.pubkey.slice(0, 8),
    title: m.title,
    subtitle: `Continuous market for exact settlement`,
    category: m.category as any,
    status,
    consensus: m.mu,
    sigma: m.sigma,
    liquidity: m.totalLiquidity,
    volume24h: Math.floor(m.totalLiquidity * 0.1),
    change24h: (Math.random() - 0.5) * 5, // Simulate real-time change
    participation: Math.floor(m.totalLiquidity / 100),
    resolutionLabel: formatDate(m.endsAt),
    resolutionSource: m.resolutionSource,
    unit: '$',
    outcomeLabel: 'Settlement',
    featured: m.mu > 150,
    agentBias: Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral',
  };
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }) + ' UTC';
}

// Generate markets that change based on current time
function generateDynamicMarkets(): Market[] {
  const now = Date.now();
  const hour = new Date(now).getHours();
  const day = Math.floor(now / (24 * 60 * 60 * 1000));
  
  return [
    {
      id: 'sol-price',
      title: 'SOL price at Friday close',
      subtitle: 'Continuous market for exact settlement on the next weekly close.',
      category: 'Crypto',
      status: 'live',
      consensus: 198.42 + Math.sin(hour / 12) * 5 + Math.random() * 2,
      sigma: 24.5 + Math.cos(hour / 6) * 3,
      liquidity: 124500 + Math.floor(Math.sin(day / 3) * 10000),
      volume24h: 89000 + Math.floor(Math.random() * 5000),
      change24h: 2.4 + (Math.random() - 0.5) * 3,
      participation: 1482,
      resolutionLabel: formatTimestamp(now + 5 * 24 * 60 * 60 * 1000),
      resolutionSource: 'Pyth + exchange reference basket',
      unit: '$',
      outcomeLabel: 'SOL / USD',
      featured: true,
      agentBias: 'bullish',
    },
    {
      id: 'btc-etf',
      title: 'BTC ETF net inflows next week',
      subtitle: 'Exact inflow amount across the major U.S. spot ETF complex.',
      category: 'Macro',
      status: 'live',
      consensus: 450 + Math.sin(hour / 8) * 30 + Math.random() * 20,
      sigma: 120,
      liquidity: 67800,
      volume24h: 42000,
      change24h: -1.1 + (Math.random() - 0.5) * 2,
      participation: 824,
      resolutionLabel: formatTimestamp(now + 7 * 24 * 60 * 60 * 1000),
      resolutionSource: 'Issuer daily reports',
      unit: '$M',
      outcomeLabel: 'Net inflows',
      agentBias: 'neutral',
    },
    {
      id: 'gpt-5-mmlu',
      title: 'GPT-5.5 MMLU score by June release',
      subtitle: 'Tracks the headline benchmark score for the next public evaluation cycle.',
      category: 'AI',
      status: 'live',
      consensus: 95.2 + Math.random() * 0.5,
      sigma: 1.5,
      liquidity: 89000,
      volume24h: 34000,
      change24h: 0.8,
      participation: 673,
      resolutionLabel: formatTimestamp(now + 30 * 24 * 60 * 60 * 1000),
      resolutionSource: 'Official model report',
      unit: '%',
      outcomeLabel: 'Benchmark score',
      agentBias: 'bullish',
    },
    {
      id: 'fed-rate',
      title: 'Fed funds target after next decision',
      subtitle: 'Continuous contract on the upper bound target rate after the next FOMC.',
      category: 'Macro',
      status: 'live',
      consensus: 4.25 + Math.sin(day / 14) * 0.15,
      sigma: 0.35,
      liquidity: 234000,
      volume24h: 120000,
      change24h: 0.2,
      participation: 2140,
      resolutionLabel: formatTimestamp(now + 14 * 24 * 60 * 60 * 1000),
      resolutionSource: 'FOMC statement',
      unit: '%',
      outcomeLabel: 'Target rate',
      featured: true,
      agentBias: 'neutral',
    },
  ];
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }) + ' UTC';
}