'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { ExperimentStatusBadge } from './ExperimentStatusBadge';
import { CreateExperimentModal } from './CreateExperimentModal';
import { formatRate } from '@/modules/experiments/service';
import { experimentsRoutes } from '@/modules/experiments/routes';
import type { ExperimentWithStats } from '@/modules/experiments/types';

interface ExperimentListClientProps {
  experiments: ExperimentWithStats[];
  ownerOptions: { id: string; name: string }[];
}

export function ExperimentListClient({ experiments, ownerOptions }: ExperimentListClientProps) {
  const [showCreate, setShowCreate] = useState(false);

  function getBestReplyRate(exp: ExperimentWithStats): string {
    const rates = exp.variants
      .map(v => v.replyRate)
      .filter((r): r is number => r !== null);
    if (rates.length === 0) return '—';
    return formatRate(Math.max(...rates));
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowCreate(true)}>+ New Experiment</Button>
      </div>

      {experiments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center">
          <p className="text-sm text-slate-500">No experiments yet. Create your first A/B test to get started.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Experiment</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Owner</TableHeaderCell>
              <TableHeaderCell>Start Date</TableHeaderCell>
              <TableHeaderCell>Variants</TableHeaderCell>
              <TableHeaderCell>Best Reply Rate</TableHeaderCell>
              <TableHeaderCell></TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {experiments.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900">{exp.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500 max-w-sm truncate">{exp.hypothesis}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <ExperimentStatusBadge status={exp.status} size="sm" />
                </TableCell>
                <TableCell className="text-slate-600">{exp.ownerName}</TableCell>
                <TableCell className="text-slate-600">{exp.startDate}</TableCell>
                <TableCell className="text-slate-600">{exp.variants.length}</TableCell>
                <TableCell>
                  <span className="font-medium text-slate-900">{getBestReplyRate(exp)}</span>
                </TableCell>
                <TableCell>
                  <Link
                    href={experimentsRoutes.detail(exp.id)}
                    className="text-sm font-medium text-slate-700 hover:text-slate-900 underline-offset-2 hover:underline"
                  >
                    View →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateExperimentModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        ownerOptions={ownerOptions}
      />
    </>
  );
}
