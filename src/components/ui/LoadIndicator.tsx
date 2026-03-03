import { cn } from '@/lib/utils/helpers';
import { formatLoadRatio } from '@/lib/utils/formatting';

interface LoadIndicatorProps {
  loadRatio: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

function getColorClass(ratio: number): string {
  if (ratio < 0.8) return 'bg-green-100 text-green-800 border-green-200';
  if (ratio <= 1.0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

function getDotClass(ratio: number): string {
  if (ratio < 0.8) return 'bg-green-500';
  if (ratio <= 1.0) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function LoadIndicator({ loadRatio, showLabel = true, size = 'md' }: LoadIndicatorProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        getColorClass(loadRatio),
        sizeClass
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', getDotClass(loadRatio))} />
      {showLabel && formatLoadRatio(loadRatio)}
    </span>
  );
}
