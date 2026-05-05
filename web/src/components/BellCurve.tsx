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
}

const BellCurve: React.FC<BellCurveProps> = ({ mu, sigma, prediction }) => {
  const data = useMemo(() => {
    const points = [];
    const start = mu - 4 * sigma;
    const end = mu + 4 * sigma;
    const step = (end - start) / 120;

    for (let x = start; x <= end; x += step) {
      const y =
        (1 / (sigma * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
      points.push({ x: parseFloat(x.toFixed(2)), y });
    }
    return points;
  }, [mu, sigma]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="bellFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E31837" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#E31837" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(227,24,55,0.08)" vertical={false} />
          <XAxis dataKey="x" type="number" domain={["dataMin", "dataMax"]} stroke="#C25B5B" fontSize={11} tickLine={false} axisLine={{ stroke: "rgba(227,24,55,0.1)" }} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: "rgba(13,2,2,0.95)", border: "1px solid rgba(227,24,55,0.2)", borderRadius: "0px", color: "#fff" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: any) => [(value as number)?.toExponential?.(3) ?? value, "Density"]}
          />
          <Area type="monotone" dataKey="y" stroke="#E31837" strokeWidth={2} fill="url(#bellFill)" animationDuration={800} />
          <ReferenceLine x={mu} stroke="#C25B5B" strokeDasharray="4 4" label={{ position: "top", value: "Consensus", fill: "#C25B5B", fontSize: 11, fontWeight: 600 }} />
          {prediction !== undefined && (
            <ReferenceLine x={prediction} stroke="#22C55E" strokeWidth={2} label={{ position: "top", value: "Your Bet", fill: "#22C55E", fontSize: 11, fontWeight: 600 }} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BellCurve;
