'use client';

import { useState } from 'react';
import { ScoringModal } from './ScoringModal';
import { Button } from '@/components/ui/Button';
import type { OutreachSampleWithReview } from '@/lib/types';

interface PendingSamplesPanelProps {
  samples: OutreachSampleWithReview[];
  reviewerId: string;
}

export function PendingSamplesPanel({ samples, reviewerId }: PendingSamplesPanelProps) {
  const [activeSample, setActiveSample] = useState<OutreachSampleWithReview | null>(null);

  if (samples.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        All samples for this week have been reviewed.
      </p>
    );
  }

  return (
    <>
      <div className="divide-y divide-slate-100">
        {samples.map((s) => (
          <div key={s.id} className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{s.userName}</span>
                <span>·</span>
                <span>{s.reqTitle}</span>
                <span>·</span>
                <span>{s.weekStartDate}</span>
                {s.review && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Scored {s.review.overallScore.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-sm text-slate-700">{s.messageText}</p>
            </div>
            <Button
              variant={s.review ? 'outline' : 'primary'}
              size="sm"
              className="shrink-0"
              onClick={() => setActiveSample(s)}
            >
              {s.review ? 'Edit Score' : 'Score'}
            </Button>
          </div>
        ))}
      </div>

      {activeSample && (
        <ScoringModal
          sample={activeSample}
          reviewerId={reviewerId}
          onClose={() => setActiveSample(null)}
        />
      )}
    </>
  );
}
