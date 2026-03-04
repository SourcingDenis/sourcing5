'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { QualityTrendPoint } from '@/lib/types';

interface QualityTrendChartProps {
  trendPoints: QualityTrendPoint[];
  sourcerName: string;
}

export function QualityTrendChart({ trendPoints, sourcerName }: QualityTrendChartProps) {
  if (trendPoints.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No reviewed samples yet for {sourcerName}.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={trendPoints} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="weekLabel"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
          }}
          formatter={(value: number) => [value.toFixed(2), 'Avg Score']}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          formatter={() => sourcerName}
        />
        <Line
          type="monotone"
          dataKey="avgScore"
          stroke="#0f172a"
          strokeWidth={2}
          dot={{ r: 4, fill: '#0f172a' }}
          activeDot={{ r: 6 }}
          name={sourcerName}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
