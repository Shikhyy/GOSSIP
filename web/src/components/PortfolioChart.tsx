"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PortfolioDataPoint {
  date: string;
  value: number;
}

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
      const change = (Math.random() - 0.5) * 0.02; // -1% to +1% daily change
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
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(227,24,55,0.1)" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "rgba(13,2,2,0.95)", border: "1px solid rgba(227,24,55,0.2)" }}
          labelStyle={{ color: "#999" }}
          formatter={(value: any) => `$${value}`} />
        <Legend verticalAlign="top" height={36} />
        <Line type="monotone" dataKey="value" stroke="#E31837" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}