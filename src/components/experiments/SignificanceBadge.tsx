import type { SignificanceFlag } from '@/modules/experiments/types';

interface SignificanceBadgeProps {
  flag: SignificanceFlag;
}

const colorMap: Record<SignificanceFlag, string> = {
  meaningful:        'bg-green-100 text-green-800 border-green-200',
  inconclusive:      'bg-slate-100 text-slate-600 border-slate-200',
  insufficient_data: 'bg-amber-50 text-amber-700 border-amber-200',
};

const labelMap: Record<SignificanceFlag, string> = {
  meaningful:        'Meaningful ✓',
  inconclusive:      'Inconclusive',
  insufficient_data: 'Need more data',
};

export function SignificanceBadge({ flag }: SignificanceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colorMap[flag]}`}
    >
      {labelMap[flag]}
    </span>
  );
}
