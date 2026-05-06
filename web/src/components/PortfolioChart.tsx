"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PortfolioDataPoint {
  date: string;
  value: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 shadow-2xl" style={{ background: "rgba(13, 2, 2, 0.95)", border: "1px solid rgba(227, 24, 55, 0.4)", backdropFilter: "blur(12px)" }}>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1 text-neutral-500">{label}</p>
        <p className="text-xl font-black text-white">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function PortfolioChart() {
  const [data, setData] = useState<PortfolioDataPoint[]>([]);

  useEffect(() => {
    // Generate sample data for last 30 days
    const sampleData: PortfolioDataPoint[] = [];
    let value = 4247.80;
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const change = (Math.random() - 0.45) * 0.015; // Subtle upward trend
      value = value * (1 + change);
      sampleData.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.round(value * 100) / 100,
      });
    }
    setData(sampleData);
  }, []);

  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-white/50">Loading chart...</div>;
  }

  return (
    <div className="w-full h-full relative group">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E31837" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#E31837" stopOpacity={0} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <XAxis 
            dataKey="date" 
            hide={true}
          />
          <YAxis 
            hide={true} 
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#E31837" 
            strokeWidth={3} 
            fill="url(#chartFill)" 
            animationDuration={1500}
            style={{ filter: "url(#glow)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}