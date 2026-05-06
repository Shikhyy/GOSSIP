"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface BellCurveProps {
  mu: number;
  sigma: number;
  prediction?: number;
  agentMu?: number;
  agentSigma?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 shadow-2xl" style={{ background: "rgba(13, 2, 2, 0.95)", border: "1px solid rgba(227, 24, 55, 0.4)", backdropFilter: "blur(8px)" }}>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: "#E31837" }}>Market Density</p>
        <p className="text-sm font-mono font-bold text-white">Target: {label}</p>
        <p className="text-xs font-mono text-white/50">Human: {payload[0]?.value?.toExponential(4)}</p>
        {payload[1] && <p className="text-xs font-mono text-blue-400">Agent: {payload[1]?.value?.toExponential(4)}</p>}
      </div>
    );
  }
  return null;
};

const BellCurve: React.FC<BellCurveProps> = ({ mu, sigma, prediction, agentMu, agentSigma }) => {
  const data = useMemo(() => {
    const points = [];
    const minVal = Math.min(mu - 4 * sigma, (agentMu || mu) - 4 * (agentSigma || sigma));
    const maxVal = Math.max(mu + 4 * sigma, (agentMu || mu) + 4 * (agentSigma || sigma));
    const step = (maxVal - minVal) / 150;

    for (let x = minVal; x <= maxVal; x += step) {
      const yHuman =
        (1 / (sigma * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
      
      let yAgent = 0;
      if (agentMu && agentSigma) {
        yAgent = (1 / (agentSigma * Math.sqrt(2 * Math.PI))) *
          Math.exp(-0.5 * Math.pow((x - (agentMu || mu)) / (agentSigma || sigma), 2));
      }

      points.push({ 
        x: parseFloat(x.toFixed(2)), 
        y: yHuman,
        yAgent: yAgent
      });
    }
    return points;
  }, [mu, sigma, agentMu, agentSigma]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="bellFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E31837" stopOpacity={0.4} />
              <stop offset="70%" stopColor="#E31837" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#E31837" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="agentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(227,24,55,0.05)" vertical={false} />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={["dataMin", "dataMax"]} 
            stroke="rgba(255,255,255,0.2)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={{ stroke: "rgba(227,24,55,0.15)" }}
            tick={{ fill: "#999", fontVariant: "tabular-nums" }}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E31837", strokeWidth: 1, strokeDasharray: "4 4" }} />
          
          {/* Human Density */}
          <Area 
            type="monotone" 
            dataKey="y" 
            stroke="#E31837" 
            strokeWidth={3} 
            fill="url(#bellFill)" 
            animationDuration={1200}
            style={{ filter: "url(#glow)" }}
          />

          {/* Agent Density */}
          {agentMu && (
            <Area 
              type="monotone" 
              dataKey="yAgent" 
              stroke="#3B82F6" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              fill="url(#agentFill)" 
              animationDuration={1500}
            />
          )}

          <ReferenceLine 
            x={mu} 
            stroke="#E31837" 
            strokeWidth={1.5}
            strokeDasharray="5 5" 
            label={{ position: "top", value: "HUMAN μ", fill: "#E31837", fontSize: 8, fontWeight: 800, letterSpacing: "0.1em" }} 
          />

          {agentMu && (
            <ReferenceLine 
              x={agentMu} 
              stroke="#3B82F6" 
              strokeWidth={1.5}
              strokeDasharray="5 5" 
              label={{ position: "bottom", value: "AGENT μ", fill: "#3B82F6", fontSize: 8, fontWeight: 800, letterSpacing: "0.1em" }} 
            />
          )}

          {prediction !== undefined && (
            <ReferenceLine 
              x={prediction} 
              stroke="#22C55E" 
              strokeWidth={2} 
              label={{ position: "top", value: "YOUR BET", fill: "#22C55E", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }} 
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BellCurve;
