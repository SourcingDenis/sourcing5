import type { ActionItem } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatting';

interface AgingActionItemAlertProps {
  items: ActionItem[];
  reportNames: Record<string, string>;
}

export function AgingActionItemAlert({ items, reportNames }: AgingActionItemAlertProps) {
  if (items.length === 0) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-amber-600 font-semibold text-sm">
          ⚠ {items.length} action item{items.length !== 1 ? 's' : ''} overdue by more than 14 days
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const daysOverdue = Math.floor(
            (new Date(today).getTime() - new Date(item.dueDate).getTime()) / 86_400_000
          );
          return (
            <li key={item.id} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
              <div>
                <span className="font-medium text-slate-900">
                  {reportNames[item.ownerId] ?? 'Unknown'}
                </span>
                <span className="mx-2 text-slate-400">—</span>
                <span className="text-slate-700">{item.description}</span>
                <span className="ml-2 text-xs text-amber-600">
                  Due {formatDate(item.dueDate)} ({daysOverdue}d overdue)
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
