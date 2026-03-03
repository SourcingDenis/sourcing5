'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadIndicator } from '@/components/ui/LoadIndicator';
import { AssignmentForm } from './AssignmentForm';
import { formatPriority, formatStatus } from '@/lib/utils/formatting';
import type { User, Req, Assignment } from '@/lib/types';

export interface EnrichedAssignment extends Assignment {
  userName: string;
  reqTitle: string;
}

interface AssignmentTableProps {
  assignments: EnrichedAssignment[];
  users: User[];
  reqs: Req[];
}

export function AssignmentTable({ assignments, users, reqs }: AssignmentTableProps) {
  const router = useRouter();
  const [editTarget, setEditTarget] = useState<EnrichedAssignment | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleDelete(id: string) {
    if (!confirm('Delete this assignment?')) return;

    const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      startTransition(() => {
        router.refresh();
      });
    }
  }

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...assignments].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Sourcer</TableHeaderCell>
            <TableHeaderCell>Req</TableHeaderCell>
            <TableHeaderCell>Priority</TableHeaderCell>
            <TableHeaderCell>Hrs / Wk</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.userName}</TableCell>
              <TableCell>
                <span className="font-mono text-xs text-slate-500">{a.reqId}</span>
                <span className="ml-2">{a.reqTitle}</span>
              </TableCell>
              <TableCell>
                <LoadIndicator
                  loadRatio={
                    a.priority === 'critical'
                      ? 1.1
                      : a.priority === 'high'
                        ? 0.85
                        : a.priority === 'medium'
                          ? 0.5
                          : 0.2
                  }
                  showLabel={false}
                  size="sm"
                />
                <span className="ml-2 text-sm">{formatPriority(a.priority)}</span>
              </TableCell>
              <TableCell>{a.estimatedHoursPerWeek}h</TableCell>
              <TableCell>{formatStatus(a.status)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditTarget(a)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(a.id)}
                    disabled={isPending}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                No assignments yet. Add one to get started.
              </td>
            </tr>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Assignment"
      >
        {editTarget && (
          <AssignmentForm
            users={users}
            reqs={reqs}
            existingAssignment={editTarget}
            onSuccess={() => setEditTarget(null)}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>
    </>
  );
}
