import { cn } from '@/lib/utils/helpers';
import type { AlertSeverity, FunnelAlert } from '@/lib/types';

interface FunnelHealthBadgeProps {
  health: AlertSeverity;
  worstAlert?: FunnelAlert | null;
  size?: 'sm' | 'md';
}

const colorMap: Record<AlertSeverity, string> = {
  red:     'bg-red-100 text-red-800 border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  flag:    'bg-orange-100 text-orange-800 border-orange-200',
  ok:      'bg-green-100 text-green-800 border-green-200',
};

const dotMap: Record<AlertSeverity, string> = {
  red:     'bg-red-500',
  warning: 'bg-yellow-500',
  flag:    'bg-orange-500',
  ok:      'bg-green-500',
};

const labelMap: Record<AlertSeverity, string> = {
  red: 'RED', warning: 'WARN', flag: 'FLAG', ok: 'OK',
};

export function FunnelHealthBadge({ health, worstAlert, size = 'md' }: FunnelHealthBadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        colorMap[health],
        sizeClass
      )}
      title={worstAlert?.message}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotMap[health])} />
      {labelMap[health]}
    </span>
  );
}
