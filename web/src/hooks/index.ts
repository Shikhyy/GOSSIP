"use client";

import { useMemo } from "react";
import { useToast as useToastContext } from "@/components/Toast";
import {
  useMarketData as useMarketDataSource,
  type MarketData as FullMarketData,
} from "./useMarketData";
import { useWalletBalance as useWalletBalanceSource } from "./useWalletBalance";
import {
  useUserPositions as useUserPositionsSource,
  type Position,
} from "./useUserPositions";

export interface MarketData {
  mu: number;
  sigma: number;
  liquidity: number;
  loading: boolean;
  error: string | null;
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
  solBalance: number;
  loading: boolean;
}

function formatDistanceFromNow(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return `${Math.floor(diffDays / 7)}w ago`;
}

function deriveCurrentPnl(position: Position) {
  if (!position.initialMu) {
    return "0.0%";
  }

  const relativeMove =
    ((position.point - position.initialMu) / position.initialMu) * 100;
  const pnl = Math.max(-99.9, relativeMove * 0.6);
  const sign = pnl >= 0 ? "+" : "";
  return `${sign}${pnl.toFixed(1)}%`;
}

export function useMarketData(marketId: string): MarketData {
  const source = useMarketDataSource(marketId);

  return {
    mu: source.data?.mu ?? 198.42,
    sigma: source.data?.sigma ?? 24.5,
    liquidity: source.data?.totalLiquidity ?? 124500,
    loading: source.loading,
    error: source.error,
  };
}

export function useWalletBalance(): WalletBalance {
  const source = useWalletBalanceSource();

  return {
    balance: source.balance,
    solBalance: source.solBalance,
    loading: source.loading,
  };
}

export function useToast() {
  return useToastContext();
}

export function useUserPositions(): {
  positions: UserPosition[];
  isLoading: boolean;
} {
  const source = useUserPositionsSource();

  const positions = useMemo(
    () =>
      source.positions.map((position) => ({
        market: position.marketTitle,
        prediction: position.point,
        stake: position.amount,
        currentPnl: deriveCurrentPnl(position),
        status: position.settled ? "settled" : "active",
        entered: formatDistanceFromNow(position.createdAt),
        mu: position.initialMu,
      })),
    [source.positions]
  );

  return {
    positions,
    isLoading: source.loading,
  };
}

export type { FullMarketData, Position };
