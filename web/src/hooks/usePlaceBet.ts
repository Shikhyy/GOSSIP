"use client";

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export function usePlaceBet(marketTitle: string) {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeBet = useCallback(async (point: number, amount: number) => {
    if (!publicKey) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Placeholder: In production, this would call the actual on-chain program
      // For now, return a mock signature to demonstrate the flow
      console.log(`Placing bet on ${marketTitle}: point=${point}, amount=${amount}`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock signature
      return 'mock-signature-' + Date.now();
    } catch (err: any) {
      console.error('Failed to place bet:', err);
      setError(err.message || 'Failed to place bet');
      return null;
    } finally {
      setLoading(false);
    }
  }, [publicKey, marketTitle]);

  return { placeBet, loading, error };
}