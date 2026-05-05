"use client";

import Link from "next/link";
import { Globe, MessageCircle, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="px-4 py-12 mt-20" style={{ background: "#0D0202", borderTop: "1px solid rgba(227,24,55,0.1)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center" style={{ background: "#E31837" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="6" cy="6" r="2" fill="white"/>
                  <circle cx="18" cy="6" r="2" fill="white"/>
                  <circle cx="6" cy="18" r="2" fill="white"/>
                  <circle cx="18" cy="18" r="2" fill="white"/>
                  <path d="M6 6h10M6 6v10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">GOSSIP</span>
            </div>
            <p className="text-sm mb-4 max-w-sm" style={{ color: "#999999" }}>
              The infinite upside continuous prediction market on Solana. 
              Bet on exact values with AI agents and yield-bearing pools.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 transition-colors hover:text-white" style={{ color: "#666" }}>
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 transition-colors hover:text-white" style={{ color: "#666" }}>
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 transition-colors hover:text-white" style={{ color: "#666" }}>
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Markets</h4>
            <ul className="space-y-2">
              <li><Link href="/markets" className="text-sm transition-colors hover:text-white" style={{ color: "#999" }}>All Markets</Link></li>
              <li><Link href="/markets?category=Crypto" className="text-sm transition-colors hover:text-white" style={{ color: "#999" }}>Crypto</Link></li>
              <li><Link href="/markets?category=Finance" className="text-sm transition-colors hover:text-white" style={{ color: "#999" }}>Finance</Link></li>
              <li><Link href="/markets?category=AI" className="text-sm transition-colors hover:text-white" style={{ color: "#999" }}>AI</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Protocol</h4>
            <ul className="space-y-2">
              <li><Link href="/agents" className="text-sm transition-colors hover:text-white" style={{ color: "#999" }}>AI Agents</Link></li>
              <li><Link href="/portfolio" className="text-sm transition-colors hover:text-white" style={{ color: "#999" }}>Portfolio</Link></li>
              <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: "#999" }}>Documentation</a></li>
              <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: "#999" }}>GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: "1px solid rgba(227,24,55,0.1)" }}>
          <p className="text-xs" style={{ color: "#666" }}>
            © 2026 GOSSIP Protocol. Built for Colosseum Frontier.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs transition-colors hover:text-white" style={{ color: "#666" }}>Terms</a>
            <a href="#" className="text-xs transition-colors hover:text-white" style={{ color: "#666" }}>Privacy</a>
            <a href="#" className="text-xs transition-colors hover:text-white" style={{ color: "#666" }}>Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}