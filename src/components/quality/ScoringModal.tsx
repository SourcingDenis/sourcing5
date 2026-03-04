'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { OutreachSampleWithReview } from '@/lib/types';

interface ScoringModalProps {
  sample: OutreachSampleWithReview;
  reviewerId: string;
  onClose: () => void;
}

const DIMENSIONS = [
  {
    key: 'personalizationScore' as const,
    label: 'Personalization',
    description: 'How well is the message tailored to this specific candidate?',
  },
  {
    key: 'relevanceScore' as const,
    label: 'Relevance',
    description: 'Does the role and pitch match what this candidate actually does?',
  },
  {
    key: 'clarityScore' as const,
    label: 'Clarity',
    description: 'Is the message clear, concise, and easy to act on?',
  },
  {
    key: 'ctaScore' as const,
    label: 'Call to Action',
    description: 'Is there a specific, low-friction ask at the end?',
  },
] as const;

type ScoreKey = (typeof DIMENSIONS)[number]['key'];

function ScoreSlider({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-500', 'bg-green-500'];
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <span
          className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${colors[value]}`}
        >
          {value}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-8 text-center text-xs text-slate-400">1</span>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-700"
        />
        <span className="w-8 text-center text-xs text-slate-400">5</span>
      </div>
      <p className="text-right text-xs font-medium text-slate-500">{labels[value]}</p>
    </div>
  );
}

export function ScoringModal({ sample, reviewerId, onClose }: ScoringModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const existing = sample.review;

  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    personalizationScore: existing?.personalizationScore ?? 3,
    relevanceScore: existing?.relevanceScore ?? 3,
    clarityScore: existing?.clarityScore ?? 3,
    ctaScore: existing?.ctaScore ?? 3,
  });

  const overall = (
    (scores.personalizationScore + scores.relevanceScore + scores.clarityScore + scores.ctaScore) /
    4
  ).toFixed(2);

  function setScore(key: ScoreKey, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        let res: Response;
        if (existing) {
          res = await fetch(`/api/quality/reviews/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scores),
          });
        } else {
          res = await fetch('/api/quality/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...scores, outreachSampleId: sample.id, reviewerId }),
          });
        }

        if (!res.ok) {
          const json = await res.json();
          setError(json.error ?? 'Failed to save review');
          return;
        }

        router.refresh();
        onClose();
      } catch {
        setError('Unexpected error. Please try again.');
      }
    });
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Score Message — ${sample.userName}`}
      className="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Message preview */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{sample.userName}</span>
            <span>·</span>
            <span>{sample.reqTitle}</span>
            <span>·</span>
            <span>{sample.weekStartDate}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {sample.messageText}
          </p>
        </div>

        {/* Score sliders */}
        <div className="space-y-4">
          {DIMENSIONS.map((dim) => (
            <ScoreSlider
              key={dim.key}
              label={dim.label}
              description={dim.description}
              value={scores[dim.key]}
              onChange={(v) => setScore(dim.key, v)}
            />
          ))}
        </div>

        {/* Overall badge */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
          <span className="text-sm font-medium text-slate-700">Overall Score</span>
          <span className="text-2xl font-bold text-slate-900">{overall} / 5</span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving…' : existing ? 'Update Score' : 'Submit Score'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
