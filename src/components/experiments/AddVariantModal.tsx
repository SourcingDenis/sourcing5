'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { experimentsRoutes } from '@/modules/experiments/routes';

interface AddVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId: string;
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export function AddVariantModal({ isOpen, onClose, experimentId }: AddVariantModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name:        fd.get('name') as string,
      description: fd.get('description') as string,
    };

    const res = await fetch(experimentsRoutes.api.variants(experimentId), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to add variant');
      return;
    }

    startTransition(() => router.refresh());
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Variant">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="var-name" className={labelClass}>Variant Name</label>
          <input
            id="var-name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder='e.g. "Control", "Variant A", "Short Subject"'
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="var-desc" className={labelClass}>Description</label>
          <textarea
            id="var-desc"
            name="description"
            required
            maxLength={500}
            rows={3}
            placeholder="Describe the outreach approach for this variant..."
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            Tip: The first variant you add is treated as the control arm.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add Variant'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
