import type { Interview } from '@/lib/types';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/Table';

const STATUS_LABELS: Record<Interview['status'], { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'text-blue-700 bg-blue-50' },
  completed: { label: 'Completed', className: 'text-emerald-700 bg-emerald-50' },
  cancelled: { label: 'Cancelled', className: 'text-slate-500 bg-slate-100' },
  no_show: { label: 'No Show', className: 'text-red-700 bg-red-50' },
};

interface InterviewListProps {
  interviews: Interview[];
  title?: string;
}

export function InterviewList({ interviews, title }: InterviewListProps) {
  if (interviews.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-500">
        No interviews found.
      </p>
    );
  }

  return (
    <div>
      {title && <h4 className="mb-2 text-sm font-semibold text-slate-700">{title}</h4>}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Stage</TableHeaderCell>
            <TableHeaderCell>Scheduled</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {interviews.map((interview) => {
            const { label, className } = STATUS_LABELS[interview.status];
            const scheduledDate = new Date(interview.scheduledAt);
            return (
              <TableRow key={interview.id}>
                <TableCell>{interview.stageName}</TableCell>
                <TableCell>
                  {scheduledDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  <span className="text-slate-400">
                    {scheduledDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${className}`}
                  >
                    {label}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
