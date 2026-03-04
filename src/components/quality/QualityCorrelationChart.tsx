'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { QualityCorrelationPoint } from '@/lib/types';

interface QualityCorrelationChartProps {
  points: QualityCorrelationPoint[];
}

interface TooltipPayload {
  payload: QualityCorrelationPoint;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm text-xs">
      <p className="font-semibold text-slate-800">{p.userName}</p>
      <p className="text-slate-500">{p.weekLabel}</p>
      <p className="mt-1 text-slate-700">
        Quality: <span className="font-medium">{p.avgScore.toFixed(2)}</span>
      </p>
      <p className="text-slate-700">
        Reply rate: <span className="font-medium">{(p.avgReplyRate * 100).toFixed(0)}%</span>
      </p>
    </div>
  );
}

export function QualityCorrelationChart({ points }: QualityCorrelationChartProps) {
  if (points.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No data yet — add outreach samples and funnel metrics for the same week.
      </p>
    );
  }

  // Convert reply_rate to percentage for display
  const data = points.map((p) => ({ ...p, replyRatePct: Number((p.avgReplyRate * 100).toFixed(1)) }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 8, right: 24, left: -8, bottom: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          type="number"
          dataKey="replyRatePct"
          name="Reply Rate"
          unit="%"
          domain={[0, 'dataMax + 5']}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'Reply Rate (%)', position: 'insideBottom', offset: -8, fontSize: 11, fill: '#64748b' }}
        />
        <YAxis
          type="number"
          dataKey="avgScore"
          name="Quality Score"
          domain={[0, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'Quality Score', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: '#64748b' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={3} stroke="#cbd5e1" strokeDasharray="4 4" />
        <ReferenceLine x={15} stroke="#fca5a5" strokeDasharray="4 4" label={{ value: '15%', fontSize: 10, fill: '#ef4444' }} />
        <Scatter
          data={data}
          fill="#0f172a"
          opacity={0.75}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
