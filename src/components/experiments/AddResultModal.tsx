'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { experimentsRoutes } from '@/modules/experiments/routes';

interface AddResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId: string;
  variantId: string;
  variantName: string;
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export function AddResultModal({
  isOpen,
  onClose,
  experimentId,
  variantId,
  variantName,
}: AddResultModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const outreachSent    = parseInt(fd.get('outreachSent')    as string, 10);
    const replies         = parseInt(fd.get('replies')         as string, 10);
    const positiveReplies = parseInt(fd.get('positiveReplies') as string, 10);

    if (replies > outreachSent) {
      setError('Replies cannot exceed outreach sent');
      return;
    }
    if (positiveReplies > replies) {
      setError('Positive replies cannot exceed replies');
      return;
    }

    const payload = { variantId, outreachSent, replies, positiveReplies };

    const res = await fetch(experimentsRoutes.api.results(experimentId), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to save results');
      return;
    }

    startTransition(() => router.refresh());
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log Results — ${variantName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="res-outreach" className={labelClass}>Outreach Sent</label>
            <input
              id="res-outreach"
              name="outreachSent"
              type="number"
              required
              min={0}
              defaultValue={0}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="res-replies" className={labelClass}>Replies</label>
            <input
              id="res-replies"
              name="replies"
              type="number"
              required
              min={0}
              defaultValue={0}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="res-positive" className={labelClass}>Positive Replies</label>
            <input
              id="res-positive"
              name="positiveReplies"
              type="number"
              required
              min={0}
              defaultValue={0}
              className={inputClass}
            />
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Results are additive — multiple log entries per variant are summed when computing rates.
        </p>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Results'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
