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

// Large gradient orbs for premium feel
const orbs = [
  { x: "10%", y: "20%", size: 500, duration: 22, color: "rgba(227, 24, 55, 0.12)" },
  { x: "85%", y: "60%", size: 450, duration: 28, color: "rgba(59, 130, 246, 0.08)" },
  { x: "70%", y: "5%", size: 350, duration: 24, color: "rgba(25, 195, 125, 0.06)" },
  { x: "15%", y: "75%", size: 320, duration: 20, color: "rgba(227, 24, 55, 0.08)" },
];

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Large gradient orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full blur-3xl"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: orb.color,
          }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.05, 0.98, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,163,255,0.08),transparent_35%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_0%,rgba(25,195,125,0.08),transparent_28%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(227,24,55,0.05),transparent_30%)]" />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-25" />

      {/* Light beams */}
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

      {/* Floating dots */}
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute h-1 w-1 rounded-full bg-white/18"
          style={{ left: dot.left, top: dot.top }}
          animate={{ opacity: [0.15, 0.45, 0.15], y: [0, -18, 0] }}
          transition={{ duration: dot.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Vignette gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030712] opacity-50" />
    </div>
  );
}
