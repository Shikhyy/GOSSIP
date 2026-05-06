"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Gossip } from "@/idl/gossip";
import IDL from "@/idl/gossip.json";

export interface Position {
  marketTitle: string;
  point: number;
  amount: number;
  initialMu: number;
  initialSigma: number;
  settled: boolean;
  payout: number;
  createdAt: number;
}

interface RawPredictionAccount {
  marketTitle?: string;
  point: number;
  amount: { toNumber(): number };
  initialMu: number;
  initialSigma: number;
  settled?: boolean;
  payout?: number;
  createdAt?: number;
}

const DEMO_POSITIONS: Position[] = [
  {
    marketTitle: "Will SOL hit $250 by Friday?",
    point: 245.0,
    amount: 50,
    initialMu: 198.42,
    initialSigma: 24.5,
    settled: false,
    payout: 0,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
];

export function useUserPositions() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const walletAddress = wallet.publicKey?.toBase58();
  const [positions, setPositions] = useState<Position[]>(DEMO_POSITIONS);
  const [loading, setLoading] = useState(false);

  const program = useMemo(() => {
    if (!connection || !wallet.publicKey) return null;
    const provider = new AnchorProvider(
      connection,
      wallet as AnchorProvider["wallet"],
      { commitment: "confirmed" }
    );
    return new Program(IDL as Idl, provider) as unknown as Program<Gossip>;
  }, [connection, wallet]);

  const fetchPositions = useCallback(async () => {
    if (!program || !wallet.publicKey) {
      setPositions(DEMO_POSITIONS);
      return;
    }
    setLoading(true);
    try {
      const allPositions = await program.account.prediction.all([
        {
          memcmp: {
            offset: 0,
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);
      setPositions(allPositions.map((p) => {
        const account = p.account as RawPredictionAccount;
        return {
          marketTitle: account.marketTitle || "",
          point: account.point,
          amount: account.amount.toNumber(),
          initialMu: account.initialMu,
          initialSigma: account.initialSigma,
          settled: account.settled || false,
          payout: account.payout || 0,
          createdAt: (account.createdAt || 0) * 1000,
        };
      }));
    } catch {
      setPositions(DEMO_POSITIONS);
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPositions();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchPositions, walletAddress]);

  return { positions, loading, refetch: fetchPositions };
}
