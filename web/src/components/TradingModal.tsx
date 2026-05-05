"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
  mu: number;
  sigma: number;
}

export function TradingModal({ isOpen, onClose, marketId, mu, sigma }: TradingModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg p-6"
        style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.3)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Advanced Trading</h2>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4" style={{ background: "rgba(227,24,55,0.1)" }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#999999" }}>Current Consensus</p>
            <p className="text-2xl font-mono font-bold text-white">μ = ${mu.toFixed(2)}</p>
            <p className="text-sm font-mono text-white">σ = {sigma.toFixed(2)}</p>
          </div>
          
          <p style={{ color: "#999999" }}>
            Advanced trading options coming soon. Place your predictions using the standard trading panel.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}