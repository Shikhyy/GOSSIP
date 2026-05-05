"use client";

import { useState } from "react";

export interface MarketData {
  mu: number;
  sigma: number;
  liquidity: number;
}

export interface UserPosition {
  market: string;
  prediction: number;
  stake: number;
  currentPnl: string;
  status: string;
  entered: string;
  mu: number;
}

export interface WalletBalance {
  balance: number;
}

export function useMarketData(_marketId: string): MarketData {
  const [data] = useState<MarketData>(() => ({
    mu: 198.42 + Math.random() * 10,
    sigma: 24.5 + Math.random() * 5,
    liquidity: 124500 + Math.floor(Math.random() * 10000),
  }));

  return data;
}

export function useWalletBalance(): WalletBalance {
  return { balance: 5000 };
}

export function useToast() {
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  return { showToast };
}

export function useUserPositions(): { positions: UserPosition[]; isLoading: boolean } {
  const [positions] = useState<UserPosition[]>(() => [
    {
      market: "Will SOL hit $250 by Friday?",
      prediction: 245.0,
      stake: 50,
      currentPnl: "+12.4%",
      status: "active",
      entered: "2 days ago",
      mu: 198.42,
    },
  ]);

  const isLoading = false;

  return { positions, isLoading };
}