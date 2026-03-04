import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SignificanceBadge } from './SignificanceBadge';
import { formatLift, formatRate } from '@/modules/experiments/service';
import type { VariantWithMetrics } from '@/modules/experiments/types';

interface VariantComparisonTableProps {
  variants: VariantWithMetrics[];
  canEdit: boolean;
  onAddResult: (variantId: string, variantName: string) => void;
}

function LiftCell({ lift }: { lift: number | null }) {
  if (lift === null) {
    return <span className="text-slate-400">—</span>;
  }
  const color = lift > 0 ? 'text-green-700 font-semibold' : lift < 0 ? 'text-red-700 font-semibold' : 'text-slate-600';
  return <span className={color}>{formatLift(lift)}</span>;
}

export function VariantComparisonTable({ variants, canEdit, onAddResult }: VariantComparisonTableProps) {
  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center">
        <p className="text-sm text-slate-500">No variants yet. Add your first variant to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Variant</TableHeaderCell>
          <TableHeaderCell>Outreach Sent</TableHeaderCell>
          <TableHeaderCell>Replies</TableHeaderCell>
          <TableHeaderCell>Reply Rate</TableHeaderCell>
          <TableHeaderCell>Reply Lift</TableHeaderCell>
          <TableHeaderCell>Positive Replies</TableHeaderCell>
          <TableHeaderCell>Positive Rate</TableHeaderCell>
          <TableHeaderCell>Positive Lift</TableHeaderCell>
          <TableHeaderCell>Significance</TableHeaderCell>
          {canEdit && <TableHeaderCell>Actions</TableHeaderCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {variants.map((v) => (
          <TableRow key={v.id} className={v.isControl ? 'bg-slate-50' : ''}>
            <TableCell>
              <div>
                <span className="font-medium text-slate-900">{v.name}</span>
                {v.isControl && (
                  <span className="ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-slate-200 text-slate-600">
                    Control
                  </span>
                )}
                <p className="mt-0.5 text-xs text-slate-500 max-w-xs truncate">{v.description}</p>
              </div>
            </TableCell>
            <TableCell>{v.totalOutreachSent}</TableCell>
            <TableCell>{v.totalReplies}</TableCell>
            <TableCell>
              <span className="font-medium">{formatRate(v.replyRate)}</span>
            </TableCell>
            <TableCell>
              <LiftCell lift={v.replyRateLift} />
            </TableCell>
            <TableCell>{v.totalPositiveReplies}</TableCell>
            <TableCell>
              <span className="font-medium">{formatRate(v.positiveRate)}</span>
            </TableCell>
            <TableCell>
              <LiftCell lift={v.positiveRateLift} />
            </TableCell>
            <TableCell>
              {v.isControl ? (
                <span className="text-slate-400 text-xs">—</span>
              ) : (
                <SignificanceBadge flag={v.replyRateSignificance} />
              )}
            </TableCell>
            {canEdit && (
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddResult(v.id, v.name)}
                >
                  Log Results
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
