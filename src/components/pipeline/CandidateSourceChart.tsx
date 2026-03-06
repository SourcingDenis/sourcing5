import type { CandidateSourceCount } from '@/lib/types';

interface CandidateSourceChartProps {
  sources: CandidateSourceCount[];
}

export function CandidateSourceChart({ sources }: CandidateSourceChartProps) {
  if (sources.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-500">
        No candidate source data available. Run a sync to populate this.
      </p>
    );
  }

  const total = sources.reduce((sum, s) => sum + s.count, 0);
  const topSources = sources.slice(0, 8);

  return (
    <div className="space-y-3">
      {topSources.map((item) => {
        const pct = total > 0 ? (item.count / total) * 100 : 0;
        return (
          <div key={item.source} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700">{item.source}</span>
              <span className="font-medium text-slate-900">
                {item.count}{' '}
                <span className="font-normal text-slate-400">({pct.toFixed(0)}%)</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      {sources.length > 8 && (
        <p className="text-xs text-slate-400">+{sources.length - 8} more sources</p>
      )}
    </div>
  );
}
