'use client';

import { useState } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/Table';
import { LoadIndicator } from '@/components/ui/LoadIndicator';
import { FunnelHealthBadge } from '@/components/funnel/FunnelHealthBadge';
import { formatCapacityHours, formatRole } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils/helpers';
import type { UserLoad, SourcerFunnelHealth } from '@/lib/types';

type SortField = 'name' | 'role' | 'weeklyCapacityHours' | 'assignedHours' | 'loadRatio';

interface TeamLoadTableProps {
  loads: UserLoad[];
  defaultSort?: SortField;
  funnelHealth?: SourcerFunnelHealth[];
}

export function TeamLoadTable({ loads, defaultSort = 'loadRatio', funnelHealth }: TeamLoadTableProps) {
  const [sortField, setSortField] = useState<SortField>(defaultSort);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  const sorted = [...loads].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortField) {
      case 'name':
        aVal = a.user.name;
        bVal = b.user.name;
        break;
      case 'role':
        aVal = a.user.role;
        bVal = b.user.role;
        break;
      case 'weeklyCapacityHours':
        aVal = a.user.weeklyCapacityHours;
        bVal = b.user.weeklyCapacityHours;
        break;
      case 'assignedHours':
        aVal = a.assignedHours;
        bVal = b.assignedHours;
        break;
      case 'loadRatio':
      default:
        aVal = a.loadRatio;
        bVal = b.loadRatio;
    }

    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const healthByUser = new Map(
    (funnelHealth ?? []).map((h) => [h.userId, h])
  );

  const showFunnelColumn = Boolean(funnelHealth);
  const colSpan = showFunnelColumn ? 7 : 6;

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
          <span className="text-xs">
            {isActive ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
          </span>
        </button>
      </TableHeaderCell>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <SortHeader field="name" label="Name" />
          <SortHeader field="role" label="Role" />
          <SortHeader field="weeklyCapacityHours" label="Capacity (hrs)" />
          <SortHeader field="assignedHours" label="Assigned (hrs)" />
          <TableHeaderCell>Available (hrs)</TableHeaderCell>
          <SortHeader field="loadRatio" label="Load" />
          {showFunnelColumn && <TableHeaderCell>Funnel</TableHeaderCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((ul) => {
          const available = Math.max(ul.user.weeklyCapacityHours - ul.assignedHours, 0);
          const health = healthByUser.get(ul.user.id);
          return (
            <TableRow key={ul.user.id}>
              <TableCell className="font-medium text-slate-900">{ul.user.name}</TableCell>
              <TableCell>{formatRole(ul.user.role)}</TableCell>
              <TableCell>{formatCapacityHours(ul.user.weeklyCapacityHours)}</TableCell>
              <TableCell>{formatCapacityHours(ul.assignedHours)}</TableCell>
              <TableCell>{formatCapacityHours(available)}</TableCell>
              <TableCell>
                <LoadIndicator loadRatio={ul.loadRatio} />
              </TableCell>
              {showFunnelColumn && (
                <TableCell>
                  {health ? (
                    <FunnelHealthBadge
                      health={health.health}
                      worstAlert={health.worstAlert}
                      size="sm"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
        {sorted.length === 0 && (
          <tr>
            <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-slate-500">
              No team members found
            </td>
          </tr>
        )}
      </TableBody>
    </Table>
  );
}
