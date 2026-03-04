import type { ExperimentStatus } from '@/lib/types/experiment';

interface ExperimentStatusBadgeProps {
  status: ExperimentStatus;
  size?: 'sm' | 'md';
}

const colorMap: Record<ExperimentStatus, string> = {
  active:    'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
};

const dotMap: Record<ExperimentStatus, string> = {
  active:    'bg-green-500',
  completed: 'bg-slate-400',
};

const labelMap: Record<ExperimentStatus, string> = {
  active:    'Active',
  completed: 'Completed',
};

export function ExperimentStatusBadge({ status, size = 'md' }: ExperimentStatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${colorMap[status]} ${sizeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotMap[status]}`} />
      {labelMap[status]}
    </span>
  );
}
