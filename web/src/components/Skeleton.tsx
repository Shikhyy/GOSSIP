"use client";

import { motion } from "framer-motion";

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`bg-white/5 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6" style={{ background: "#1A0808", border: "1px solid rgba(227,24,55,0.1)" }}>
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-2 px-6 py-4">
      <Skeleton className="h-4 w-8" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}