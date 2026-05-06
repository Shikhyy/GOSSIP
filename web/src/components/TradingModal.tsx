"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { IDKitWidget, VerificationLevel, ISuccessResult } from "@worldcoin/idkit";

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
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = (result: ISuccessResult) => {
    console.log("World ID Verified:", result);
    setIsVerified(true);
  };

  const handleConfirm = async () => {
    if (stake > balance) {
      setError("Insufficient balance");
      return;
    }
    if (!isVerified) {
      setError("Please verify with World ID first");
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
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-md p-8"
            style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Confirm Position</h2>
                <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#999" }}>GOSSIP Continuous AMM</p>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5 mb-10">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider" style={{ color: "#666" }}>Prediction Target</span>
                <span className="font-mono text-lg font-bold text-white">${prediction}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider" style={{ color: "#666" }}>Stake Amount</span>
                <span className="font-mono text-lg font-bold text-white">{stake} CASH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider" style={{ color: "#666" }}>Upside Multiplier</span>
                <span className="font-mono text-lg font-bold text-green-500">{multiplier}x</span>
              </div>
              <div className="pt-5 flex justify-between items-end" style={{ borderTop: "1px solid rgba(227,24,55,0.15)" }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "#E31837" }}>Maximum Payout</span>
                  <span className="font-mono text-2xl font-bold text-white">{potentialPayout}</span>
                </div>
                <span className="text-xs font-bold mb-1" style={{ color: "#999" }}>CASH</span>
              </div>

              {/* World ID Integration */}
              <div className="pt-6">
                {!isVerified ? (
                  <IDKitWidget
                    app_id="app_staging_123" // Placeholder for hackathon
                    action="gossip_bet"
                    onSuccess={handleVerify}
                    verification_level={VerificationLevel.Device}
                  >
                    {({ open }) => (
                      <button
                        onClick={open}
                        className="w-full py-3 px-4 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest transition-all border border-dashed hover:bg-white/5"
                        style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        Verify Humanity with World ID
                      </button>
                    )}
                  </IDKitWidget>
                ) : (
                  <div 
                    className="w-full py-3 px-4 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest"
                    style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verified Human
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 text-xs font-semibold tracking-wide text-red-400" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={isLoading || !isVerified}
              className="w-full py-5 font-bold text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "#E31837", boxShadow: "0 0 20px rgba(227,24,55,0.3)" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  Place Bet <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-[9px] text-center mt-4 uppercase tracking-[0.2em]" style={{ color: "#444" }}>
              Infinite Upside • No Caps • Gaussian AMM
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}