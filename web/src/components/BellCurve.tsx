"use client";

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

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
    const step = (end - start) / 100;

    for (let x = start; x <= end; x += step) {
      const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
      points.push({ x: parseFloat(x.toFixed(2)), y });
    }
    return points;
  }, [mu, sigma]);

  return (
    <div className="w-full h-64 bg-slate-900/50 rounded-xl p-4 border border-slate-700">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={['dataMin', 'dataMax']} 
            stroke="#94a3b8"
            fontSize={12}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Area 
            type="monotone" 
            dataKey="y" 
            stroke="#8b5cf6" 
            fill="#8b5cf6" 
            fillOpacity={0.2} 
            animationDuration={500}
          />
          <ReferenceLine x={mu} stroke="#f59e0b" label={{ position: 'top', value: 'Consensus', fill: '#f59e0b', fontSize: 12 }} />
          {prediction !== undefined && (
            <ReferenceLine x={prediction} stroke="#10b981" label={{ position: 'top', value: 'Your Bet', fill: '#10b981', fontSize: 12 }} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BellCurve;
