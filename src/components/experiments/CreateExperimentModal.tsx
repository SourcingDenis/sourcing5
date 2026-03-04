'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { experimentsRoutes } from '@/modules/experiments/routes';

interface CreateExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerOptions: { id: string; name: string }[];
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export function CreateExperimentModal({ isOpen, onClose, ownerOptions }: CreateExperimentModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name:       fd.get('name') as string,
      hypothesis: fd.get('hypothesis') as string,
      startDate:  fd.get('startDate') as string,
      ownerId:    fd.get('ownerId') as string,
    };

    const res = await fetch(experimentsRoutes.api.list, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to create experiment');
      return;
    }

    startTransition(() => router.refresh());
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Experiment" className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="exp-name" className={labelClass}>Experiment Name</label>
          <input
            id="exp-name"
            name="name"
            type="text"
            required
            maxLength={200}
            placeholder="e.g. Subject Line Personalization Test"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="exp-hypothesis" className={labelClass}>Hypothesis</label>
          <textarea
            id="exp-hypothesis"
            name="hypothesis"
            required
            minLength={10}
            maxLength={1000}
            rows={3}
            placeholder="e.g. Adding the candidate's current company in the subject line will increase reply rate by 5pp vs. a generic subject."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="exp-owner" className={labelClass}>Owner</label>
          <select id="exp-owner" name="ownerId" required className={inputClass}>
            <option value="">Select owner...</option>
            {ownerOptions.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="exp-start" className={labelClass}>Start Date</label>
          <input
            id="exp-start"
            name="startDate"
            type="date"
            required
            defaultValue={today}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Experiment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
