"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const DEMO_BALANCE = 5000;

export function useWalletBalance() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState(DEMO_BALANCE);
  const [solBalance, setSolBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet.publicKey || !connection) {
        setBalance(DEMO_BALANCE);
        setLoading(false);
        return;
      }
      try {
        const solBal = await connection.getBalance(wallet.publicKey);
        setSolBalance(solBal / LAMPORTS_PER_SOL);
        setBalance(DEMO_BALANCE);
      } catch (err) {
        setBalance(DEMO_BALANCE);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [wallet.publicKey, connection]);

  return { balance, solBalance, loading };
}