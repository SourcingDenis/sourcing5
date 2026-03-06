import type { PipelineView } from '@/lib/types';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/Table';

function rateColor(rate: number): string {
  if (rate >= 0.5) return 'text-emerald-700 bg-emerald-50';
  if (rate >= 0.25) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
}

interface PassthroughTableProps {
  view: PipelineView;
}

export function PassthroughTable({ view }: PassthroughTableProps) {
  if (view.stages.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-500">
        No pipeline stages synced for this req yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stage breakdown */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">Stage Breakdown</h4>
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Stage</TableHeaderCell>
              <TableHeaderCell className="text-right">Candidates</TableHeaderCell>
              <TableHeaderCell className="text-right">Passthrough to Next</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {view.stages.map((stage, i) => {
              const nextRate = view.passthroughRates[i];
              return (
                <TableRow key={stage.ashbyStageId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-700">
                        {i + 1}
                      </span>
                      {stage.stageName}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{stage.candidateCount}</TableCell>
                  <TableCell className="text-right">
                    {nextRate ? (
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${rateColor(nextRate.passthroughRate)}`}
                      >
                        {(nextRate.passthroughRate * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Overall conversion */}
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm">
        <span className="text-slate-600">Overall conversion (first → last stage)</span>
        <span
          className={`font-semibold ${rateColor(view.overallConversion)} inline-block rounded px-2 py-0.5 text-xs`}
        >
          {(view.overallConversion * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
