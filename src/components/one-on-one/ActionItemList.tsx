'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table, TableHead, TableBody, TableRow,
  TableHeaderCell, TableCell,
} from '@/components/ui/Table';
import { cn } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/formatting';
import { oneOnOneRoutes } from '@/modules/one-on-one/routes';
import type { ActionItem } from '@/lib/types';

interface ActionItemListProps {
  items: ActionItem[];
  ownerNames?: Record<string, string>;  // ownerId → name, optional
}

export function ActionItemList({ items, ownerNames }: ActionItemListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId]    = useState<string | null>(null);
  const [errors, setErrors]          = useState<Record<string, string>>({});

  const today = new Date().toISOString().split('T')[0];

  async function markDone(id: string) {
    setLoadingId(id);
    setErrors((prev) => ({ ...prev, [id]: '' }));
    try {
      const res = await fetch(oneOnOneRoutes.api.actionItem(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      });
      if (!res.ok) {
        const body = await res.json();
        setErrors((prev) => ({ ...prev, [id]: body.error ?? 'Failed' }));
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setErrors((prev) => ({ ...prev, [id]: 'Network error' }));
    } finally {
      setLoadingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No action items yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          {ownerNames && <TableHeaderCell>Owner</TableHeaderCell>}
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Due Date</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Action</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item) => {
          const isOverdue = item.dueDate < today && item.status === 'open';
          return (
            <TableRow key={item.id}>
              {ownerNames && (
                <TableCell className="font-medium text-slate-900">
                  {ownerNames[item.ownerId] ?? 'Unknown'}
                </TableCell>
              )}
              <TableCell className={cn(isOverdue && 'text-red-700')}>
                {item.description}
              </TableCell>
              <TableCell className={cn('text-xs', isOverdue && 'text-red-600 font-medium')}>
                {formatDate(item.dueDate)}
                {isOverdue && ' ⚠'}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    item.status === 'done'
                      ? 'bg-green-100 text-green-700'
                      : isOverdue
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-700'
                  )}
                >
                  {item.status === 'done' ? 'Done' : isOverdue ? 'Overdue' : 'Open'}
                </span>
              </TableCell>
              <TableCell>
                {item.status === 'open' ? (
                  <div>
                    <button
                      onClick={() => markDone(item.id)}
                      disabled={isPending || loadingId === item.id}
                      className="text-sm font-medium text-slate-700 underline hover:text-slate-900 disabled:opacity-50"
                    >
                      {loadingId === item.id ? 'Saving…' : 'Mark done'}
                    </button>
                    {errors[item.id] && (
                      <p className="mt-0.5 text-xs text-red-600">{errors[item.id]}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
