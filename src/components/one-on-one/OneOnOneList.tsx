import Link from 'next/link';
import {
  Table, TableHead, TableBody, TableRow,
  TableHeaderCell, TableCell,
} from '@/components/ui/Table';
import { CompleteOneOnOneButton } from './CompleteOneOnOneButton';
import { formatDate } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils/helpers';
import type { OneOnOneWithParticipants } from '@/lib/types';

interface OneOnOneListProps {
  ones: OneOnOneWithParticipants[];
}

function StatusBadge({ one }: { one: OneOnOneWithParticipants }) {
  const now = new Date().toISOString();

  if (one.completedAt) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        Completed
      </span>
    );
  }
  if (one.scheduledAt < now) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      Scheduled
    </span>
  );
}

export function OneOnOneList({ ones }: OneOnOneListProps) {
  if (ones.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No 1:1s scheduled yet. Click &ldquo;Schedule 1:1&rdquo; to get started.
      </p>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Report</TableHeaderCell>
          <TableHeaderCell>Scheduled</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Action Items</TableHeaderCell>
          <TableHeaderCell>Agenda</TableHeaderCell>
          <TableHeaderCell>Complete</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {ones.map((one) => (
          <TableRow key={one.id}>
            <TableCell className="font-medium text-slate-900">{one.reportName}</TableCell>
            <TableCell>{formatDate(one.scheduledAt)}</TableCell>
            <TableCell>
              <StatusBadge one={one} />
            </TableCell>
            <TableCell>
              {one.openActionItemCount > 0 ? (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    'bg-amber-100 text-amber-700'
                  )}
                >
                  {one.openActionItemCount} open
                </span>
              ) : (
                <span className="text-xs text-slate-400">None</span>
              )}
            </TableCell>
            <TableCell>
              <Link
                href={`/one-on-one/${one.id}/agenda`}
                className="text-sm font-medium text-slate-700 underline hover:text-slate-900"
              >
                View agenda
              </Link>
            </TableCell>
            <TableCell>
              <CompleteOneOnOneButton
                oneOnOneId={one.id}
                isCompleted={one.completedAt !== null}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
