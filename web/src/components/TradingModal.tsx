"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2 } from "lucide-react";

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  prediction: number;
  stake: number;
  multiplier: string;
  potentialPayout: string;
  balance: number;
}

export default function TradingModal({
  isOpen,
  onClose,
  onConfirm,
  prediction,
  stake,
  multiplier,
  potentialPayout,
  balance,
}: TradingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (stake > balance) {
      setError("Insufficient balance");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md p-6"
            style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Confirm Prediction</h2>
              <button onClick={onClose} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-white/60">Prediction</span>
                <span className="font-mono text-white">${prediction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Stake</span>
                <span className="font-mono text-white">{stake} CASH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Multiplier</span>
                <span className="font-mono text-green-500">{multiplier}x</span>
              </div>
              <div className="flex justify-between pt-4" style={{ borderTop: "1px solid rgba(227,24,55,0.2)" }}>
                <span className="font-semibold text-white">Potential Payout</span>
                <span className="font-mono font-bold text-lg text-white">{potentialPayout} CASH</span>
              </div>
              {error && (
                <div className="p-3 text-sm text-red-400" style={{ background: "rgba(239,68,68,0.1)" }}>
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full py-4 font-semibold text-white uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "#E31837" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  Confirm <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}