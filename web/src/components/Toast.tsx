"use client";

import { createContext, useContext, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, X, ExternalLink } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  txSignature?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, txSignature?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToastId = useRef(0);

  const showToast = (type: ToastType, message: string, txSignature?: string) => {
    nextToastId.current += 1;
    const id = `toast-${nextToastId.current}`;
    setToasts((prev) => [...prev, { id, type, message, txSignature }]);
    setTimeout(() => removeToast(id), 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const colors = {
    success: { icon: "#19C37D", border: "rgba(25, 195, 125, 0.3)", bg: "rgba(25, 195, 125, 0.08)" },
    error: { icon: "#FF5F6D", border: "rgba(255, 95, 109, 0.3)", bg: "rgba(255, 95, 109, 0.08)" },
    info: { icon: "#4da3ff", border: "rgba(77, 163, 255, 0.3)", bg: "rgba(77, 163, 255, 0.08)" },
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" style={{ color: colors.success.icon }} />,
    error: <XCircle className="w-5 h-5" style={{ color: colors.error.icon }} />,
    info: <AlertCircle className="w-5 h-5" style={{ color: colors.info.icon }} />,
  };

  const getSolscanLink = (signature: string) => 
    `https://solscan.io/tx/${signature}?cluster=devnet`;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = colors[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                className="glass-panel px-4 py-3 flex items-start gap-3 min-w-[320px] max-w-[400px]"
                style={{ borderLeft: `3px solid ${style.icon}` }}
              >
                {icons[toast.type]}
                <div className="flex-1">
                  <p className="text-sm text-white font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>{toast.message}</p>
                  {toast.txSignature && (
                    <a
                      href={getSolscanLink(toast.txSignature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 mt-2 hover:underline"
                      style={{ color: style.icon, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View transaction
                    </a>
                  )}
                </div>
                <button 
                  onClick={() => removeToast(toast.id)} 
                  className="text-[#6B7280] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
