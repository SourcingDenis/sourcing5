'use client';

import { useState } from 'react';
import {
  Table, TableHead, TableBody, TableRow,
  TableHeaderCell, TableCell,
} from '@/components/ui/Table';
import { FunnelHealthBadge } from './FunnelHealthBadge';
import { cn } from '@/lib/utils/helpers';
import type { SourcerFunnelSummary } from '@/lib/types';

type SortField = 'userName' | 'totalOutreach' | 'avgReplyRate' | 'totalScreens';

interface FunnelSummaryTableProps {
  summaries: SourcerFunnelSummary[];
}

export function FunnelSummaryTable({ summaries }: FunnelSummaryTableProps) {
  const [sortField, setSortField] = useState<SortField>('avgReplyRate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sorted = [...summaries].sort((a, b) => {
    const vals: Record<SortField, string | number> = {
      userName:      a.userName,
      totalOutreach: a.totalOutreach,
      avgReplyRate:  a.avgReplyRate,
      totalScreens:  a.totalScreens,
    };
    const bVals: Record<SortField, string | number> = {
      userName:      b.userName,
      totalOutreach: b.totalOutreach,
      avgReplyRate:  b.avgReplyRate,
      totalScreens:  b.totalScreens,
    };

    const aVal = vals[sortField];
    const bVal = bVals[sortField];
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function SortHeader({ field, label }: { field: SortField; label: string }) {
    const isActive = sortField === field;
    return (
      <TableHeaderCell>
        <button
          onClick={() => handleSort(field)}
          className={cn(
            'flex items-center gap-1 hover:text-slate-900',
            isActive ? 'text-slate-900' : 'text-slate-600'
          )}
        >
          {label}
          <span className="text-xs">{isActive ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
        </button>
      </TableHeaderCell>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <SortHeader field="userName"      label="Sourcer" />
          <SortHeader field="totalOutreach" label="Outreach" />
          <TableHeaderCell>Replies</TableHeaderCell>
          <SortHeader field="avgReplyRate"  label="Reply Rate" />
          <TableHeaderCell>Positive</TableHeaderCell>
          <SortHeader field="totalScreens"  label="Screens" />
          <TableHeaderCell>Health</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((s) => (
          <TableRow key={s.userId}>
            <TableCell className="font-medium text-slate-900">{s.userName}</TableCell>
            <TableCell>{s.totalOutreach}</TableCell>
            <TableCell>{s.totalReplies}</TableCell>
            <TableCell>
              <span className={cn(
                'font-mono text-sm',
                s.avgReplyRate < 0.15 ? 'text-red-600' : 'text-slate-700'
              )}>
                {(s.avgReplyRate * 100).toFixed(0)}%
              </span>
            </TableCell>
            <TableCell>{s.totalPositive}</TableCell>
            <TableCell>{s.totalScreens}</TableCell>
            <TableCell>
              <FunnelHealthBadge
                health={s.overallHealth}
                worstAlert={s.metrics.flatMap((m) => m.alerts)[0] ?? null}
                size="sm"
              />
            </TableCell>
          </TableRow>
        ))}
        {sorted.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
              No funnel metrics for this week
            </td>
          </tr>
        )}
      </TableBody>
    </Table>
  );
}
