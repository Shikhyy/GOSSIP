"use client";

import { motion } from "framer-motion";

const beams = [
  { top: "16%", width: "48rem", left: "-8rem", duration: 16, opacity: 0.2 },
  { top: "34%", width: "34rem", left: "42%", duration: 20, opacity: 0.16 },
  { top: "68%", width: "44rem", left: "-2rem", duration: 18, opacity: 0.12 },
];

const dots = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 17 + 11) % 100}%`,
  top: `${(index * 31 + 7) % 100}%`,
  duration: 7 + (index % 5),
}));

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,163,255,0.08),transparent_35%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_0%,rgba(25,195,125,0.08),transparent_28%)]" />

      <div className="absolute inset-0 grid-panel opacity-30" />

      {beams.map((beam, index) => (
        <motion.div
          key={index}
          className="absolute h-px"
          style={{
            top: beam.top,
            left: beam.left,
            width: beam.width,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(77,163,255,0.18) 40%, rgba(25,195,125,0.16) 60%, transparent 100%)",
            opacity: beam.opacity,
          }}
          animate={{ x: [0, 28, -10, 0] }}
          transition={{ duration: beam.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute h-1 w-1 rounded-full bg-white/18"
          style={{ left: dot.left, top: dot.top }}
          animate={{ opacity: [0.15, 0.45, 0.15], y: [0, -18, 0] }}
          transition={{ duration: dot.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050c16] to-transparent" />
    </div>
  );
}
