'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/helpers';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/Table';
import type { SourcerQualitySummary, QualityTrend } from '@/lib/types';

interface SourcerQualityTableProps {
  summaries: SourcerQualitySummary[];
}

function TrendBadge({ trend }: { trend: QualityTrend }) {
  const styles: Record<QualityTrend, string> = {
    rising:    'bg-green-100 text-green-800',
    declining: 'bg-red-100 text-red-800',
    stable:    'bg-slate-100 text-slate-600',
  };
  const labels: Record<QualityTrend, string> = {
    rising:    '↑ Rising',
    declining: '↓ Declining',
    stable:    '→ Stable',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[trend]
      )}
    >
      {labels[trend]}
    </span>
  );
}

function ScoreDot({ score }: { score: number | null }) {
  if (score === null) return <span className="text-slate-400">—</span>;

  const color =
    score >= 4   ? 'text-green-700 font-semibold' :
    score >= 3   ? 'text-slate-700 font-semibold' :
    score >= 2   ? 'text-orange-600 font-semibold' :
                   'text-red-600 font-semibold';

  return <span className={color}>{score.toFixed(2)}</span>;
}

type SortKey = 'name' | 'score' | 'reviewed' | 'pending';

export function SourcerQualityTable({ summaries }: SourcerQualityTableProps) {
  const [sortKey, setSortKey]   = useState<SortKey>('score');
  const [sortAsc, setSortAsc]   = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  const sorted = [...summaries].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name')     cmp = a.userName.localeCompare(b.userName);
    if (sortKey === 'score')    cmp = (a.thisWeekAvg ?? -1) - (b.thisWeekAvg ?? -1);
    if (sortKey === 'reviewed') cmp = a.reviewedCount - b.reviewedCount;
    if (sortKey === 'pending')  cmp = a.pendingCount - b.pendingCount;
    return sortAsc ? cmp : -cmp;
  });

  function SortHeader({ col, label }: { col: SortKey; label: string }) {
    return (
      <TableHeaderCell>
        <button
          type="button"
          className="select-none hover:text-slate-600"
          onClick={() => toggleSort(col)}
        >
          {label}
          {sortKey === col ? (sortAsc ? ' ↑' : ' ↓') : ''}
        </button>
      </TableHeaderCell>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <SortHeader col="name"     label="Sourcer" />
          <SortHeader col="score"    label="This Week Avg" />
          <TableHeaderCell>Trend</TableHeaderCell>
          <SortHeader col="reviewed" label="Reviewed" />
          <SortHeader col="pending"  label="Pending" />
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((s) => (
          <TableRow key={s.userId}>
            <TableCell className="font-medium text-slate-900">{s.userName}</TableCell>
            <TableCell><ScoreDot score={s.thisWeekAvg} /></TableCell>
            <TableCell><TrendBadge trend={s.trend} /></TableCell>
            <TableCell className="text-slate-700">{s.reviewedCount}</TableCell>
            <TableCell className="text-slate-700">{s.pendingCount}</TableCell>
          </TableRow>
        ))}
        {sorted.length === 0 && (
          <TableRow>
            <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
              No samples this week
            </td>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
