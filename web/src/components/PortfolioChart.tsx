"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { portfolioSeries } from "@/lib/demo-data";

interface PortfolioChartProps {
  points?: number[];
}

interface PortfolioDataPoint {
  label: string;
  value: number;
}

interface PortfolioTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string | number;
}

function CustomTooltip({ active, payload, label }: PortfolioTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#08101d]/95 px-4 py-3 shadow-2xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#8fa4c2]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${value.toLocaleString()}</p>
    </div>
  );
}

export default function PortfolioChart({ points = portfolioSeries }: PortfolioChartProps) {
  const data = useMemo<PortfolioDataPoint[]>(
    () =>
      points.map((value, index) => ({
        label: `D${index + 1}`,
        value,
      })),
    [points]
  );

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 grid-bg opacity-25" />
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolio-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#19C37D" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#19C37D" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <YAxis hide domain={["dataMin - 60", "dataMax + 80"]} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(77,163,255,0.28)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4da3ff"
            strokeWidth={2.8}
            fill="url(#portfolio-fill)"
            animationDuration={1100}
            className="chart-glow"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
