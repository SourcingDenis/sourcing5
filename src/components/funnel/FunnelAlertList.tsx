import { cn } from '@/lib/utils/helpers';
import type { FunnelAlert } from '@/lib/types';

interface FunnelAlertListProps {
  alerts: FunnelAlert[];
  className?: string;
}

const alertStyles: Record<string, string> = {
  red:     'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  flag:    'bg-orange-50 border-orange-200 text-orange-700',
  ok:      'bg-green-50 border-green-200 text-green-700',
};

export function FunnelAlertList({ alerts, className }: FunnelAlertListProps) {
  if (alerts.length === 0) return null;

  return (
    <ul className={cn('space-y-1', className)}>
      {alerts.map((a, i) => (
        <li
          key={i}
          className={cn(
            'rounded-md border px-3 py-1.5 text-xs font-medium',
            alertStyles[a.severity]
          )}
        >
          {a.message}
        </li>
      ))}
    </ul>
  );
}
