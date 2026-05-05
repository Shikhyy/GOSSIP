"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const particles = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  duration: 5 + ((i * 13) % 5),
  delay: ((i * 7) % 4),
}));

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Red gradient orbs */}
      <motion.div
        animate={{ x: [0, 20, -10, 0], y: [0, -30, 15, 0], scale: [1, 1.08, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-5%] left-[5%] w-[500px] h-[500px]"
        style={{ background: "radial-gradient(circle, rgba(227,24,55,0.15) 0%, transparent 65%)", filter: "blur(70px)" }}
      />
      <motion.div
        animate={{ x: [0, -25, 20, 0], y: [0, 25, -20, 0], scale: [1, 0.92, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[0%] w-[450px] h-[450px]"
        style={{ background: "radial-gradient(circle, rgba(74,4,4,0.5) 0%, transparent 65%)", filter: "blur(70px)" }}
      />
      <motion.div
        animate={{ x: [0, 30, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[50%] right-[15%] w-[250px] h-[250px]"
        style={{ background: "radial-gradient(circle, rgba(194,91,91,0.08) 0%, transparent 65%)", filter: "blur(50px)" }}
      />

      {/* Floating particles */}
      {mounted && particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-[2px] h-[2px] rounded-full"
          style={{ left: p.left, top: p.top, background: "rgba(227,24,55,0.25)" }}
          animate={{ y: [0, -25, 0], opacity: [0.15, 0.5, 0.15], scale: [1, 1.3, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Geometric grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(227,24,55,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(227,24,55,0.025) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}
