'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { funnelRoutes } from '@/modules/funnel';
import { getWeekStartDate } from '@/lib/utils/helpers';
import type { User, FunnelMetric } from '@/lib/types';
import type { Req } from '@/lib/types';

interface FunnelMetricFormProps {
  users: User[];
  reqs: Req[];
  existing?: FunnelMetric;
  onSuccess: () => void;
  onCancel: () => void;
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export function FunnelMetricForm({
  users,
  reqs,
  existing,
  onSuccess,
  onCancel,
}: FunnelMetricFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultWeek =
    existing?.weekStartDate ?? getWeekStartDate().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      userId:          fd.get('userId') as string,
      reqId:           fd.get('reqId') as string,
      weekStartDate:   fd.get('weekStartDate') as string,
      outreachSent:    Number(fd.get('outreachSent')),
      replies:         Number(fd.get('replies')),
      positiveReplies: Number(fd.get('positiveReplies')),
    };

    try {
      const res = await fetch(funnelRoutes.api.metrics, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Something went wrong');
        return;
      }

      startTransition(() => { router.refresh(); });
      onSuccess();
    } catch {
      setError('Network error — please try again');
    }
  }

  const sourcers = users.filter((u) => u.role === 'sourcer');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Sourcer</label>
        <select
          name="userId"
          className={inputClass}
          required
          defaultValue={existing?.userId ?? ''}
        >
          <option value="" disabled>Select sourcer...</option>
          {sourcers.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Requisition</label>
        <select
          name="reqId"
          className={inputClass}
          required
          defaultValue={existing?.reqId ?? ''}
        >
          <option value="" disabled>Select req...</option>
          {reqs.map((r) => (
            <option key={r.id} value={r.id}>{r.id} — {r.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Week of</label>
        <input
          name="weekStartDate"
          type="date"
          className={inputClass}
          defaultValue={defaultWeek}
          required
        />
      </div>

      {[
        { name: 'outreachSent',    label: 'Outreach Sent',    val: existing?.outreachSent },
        { name: 'replies',         label: 'Replies',          val: existing?.replies },
        { name: 'positiveReplies', label: 'Positive Replies', val: existing?.positiveReplies },
      ].map(({ name, label, val }) => (
        <div key={name}>
          <label className={labelClass}>{label}</label>
          <input
            name={name}
            type="number"
            min="0"
            className={inputClass}
            defaultValue={val ?? 0}
            required
          />
        </div>
      ))}

      <p className="text-xs text-slate-500">
        Screens booked is auto-populated from Ashby sync.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Metrics'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
