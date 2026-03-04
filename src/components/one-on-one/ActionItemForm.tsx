'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { oneOnOneRoutes } from '@/modules/one-on-one/routes';
import type { ActionItem } from '@/lib/types';

interface ActionItemFormProps {
  ownerId: string;
  oneOnOneId?: string | null;
  existing?: ActionItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ActionItemForm({
  ownerId,
  oneOnOneId,
  existing,
  onSuccess,
  onCancel,
}: ActionItemFormProps) {
  const [description, setDescription] = useState(existing?.description ?? '');
  const [dueDate, setDueDate]         = useState(existing?.dueDate ?? '');
  const [status, setStatus]           = useState(existing?.status ?? 'open');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const body = existing
      ? { description, dueDate, status }
      : { ownerId, oneOnOneId: oneOnOneId ?? null, description, dueDate };

    try {
      const url    = existing
        ? oneOnOneRoutes.api.actionItem(existing.id)
        : oneOnOneRoutes.api.actionItems;
      const method = existing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
        return;
      }
      onSuccess();
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          placeholder="What needs to happen?"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Due Date
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {existing && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'open' | 'done')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="open">Open</option>
            <option value="done">Done</option>
          </select>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Saving…' : existing ? 'Update item' : 'Add item'}
        </Button>
      </div>
    </form>
  );
}
