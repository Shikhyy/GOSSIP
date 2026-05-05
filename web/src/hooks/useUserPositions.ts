"use client";

import { useState, useEffect, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, Idl, BN } from "@coral-xyz/anchor";
import { Gossip } from "@/idl/gossip";
import IDL from "@/idl/gossip.json";

const PROGRAM_ID = new web3.PublicKey(
  "9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi"
);

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
  const [positions, setPositions] = useState<Position[]>(DEMO_POSITIONS);
  const [loading, setLoading] = useState(false);

  const program = useMemo(() => {
    if (!connection || !wallet.publicKey) return null;
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: "confirmed" }
    );
    return new Program(IDL as Idl, provider) as unknown as Program<Gossip>;
  }, [connection, wallet]);

  const fetchPositions = async () => {
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
      setPositions(
        allPositions.map((p) => ({
          marketTitle: (p.account as any).marketTitle || "",
          point: p.account.point,
          amount: p.account.amount.toNumber(),
          initialMu: p.account.initialMu,
          initialSigma: p.account.initialSigma,
          settled: (p.account as any).settled || false,
          payout: (p.account as any).payout || 0,
          createdAt: ((p.account as any).createdAt || 0) * 1000,
        }))
      );
    } catch (err) {
      setPositions(DEMO_POSITIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [program, wallet.publicKey?.toBase58()]);

  return { positions, loading, refetch: fetchPositions };
}