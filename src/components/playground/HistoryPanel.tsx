'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ContentTypeBadge } from './ContentTypeBadge';
import type { HistoryEntry } from '@/modules/playground/types';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  activeEntryId: string | null;
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function HistoryPanel({ entries, activeEntryId, onSelect, onClear }: HistoryPanelProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            Your generation history will appear here. Each generation is saved automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Session History</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {entries.map((entry) => {
            const isActive = entry.id === activeEntryId;
            const time = new Date(entry.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelect(entry)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  isActive
                    ? 'border-slate-400 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <ContentTypeBadge type={entry.request.contentType} />
                  <span className="text-xs text-slate-400">{time}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                  {entry.request.refinementInstruction || entry.request.prompt}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {entry.variants.length} variant{entry.variants.length !== 1 ? 's' : ''}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
