'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { User, Req, Assignment } from '@/lib/types';

interface AssignmentFormProps {
  users: User[];
  reqs: Req[];
  existingAssignment?: Assignment;
  onSuccess: () => void;
  onCancel: () => void;
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export function AssignmentForm({
  users,
  reqs,
  existingAssignment,
  onSuccess,
  onCancel,
}: AssignmentFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = !!existingAssignment;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      userId: formData.get('userId') as string,
      reqId: formData.get('reqId') as string,
      priority: formData.get('priority') as string,
      estimatedHoursPerWeek: Number(formData.get('estimatedHoursPerWeek')),
      status: formData.get('status') as string,
    };

    try {
      const url = isEditing
        ? `/api/assignments/${existingAssignment.id}`
        : '/api/assignments';
      const method = isEditing ? 'PUT' : 'POST';

      const body = isEditing
        ? {
            priority: payload.priority,
            estimatedHoursPerWeek: payload.estimatedHoursPerWeek,
            status: payload.status,
          }
        : payload;

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

      startTransition(() => {
        router.refresh();
      });
      onSuccess();
    } catch {
      setError('Network error — please try again');
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <>
          <div>
            <label className={labelClass}>Sourcer</label>
            <select name="userId" className={inputClass} required defaultValue="">
              <option value="" disabled>
                Select sourcer...
              </option>
              {users
                .filter((u) => u.role === 'sourcer')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Req ID</label>
            <select name="reqId" className={inputClass} required defaultValue="">
              <option value="" disabled>
                Select req...
              </option>
              {reqs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} — {r.title}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className={labelClass}>Priority</label>
        <select
          name="priority"
          className={inputClass}
          defaultValue={existingAssignment?.priority ?? 'medium'}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Hours / Week</label>
        <input
          name="estimatedHoursPerWeek"
          type="number"
          min="1"
          max="80"
          className={inputClass}
          defaultValue={existingAssignment?.estimatedHoursPerWeek ?? ''}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Status</label>
        <select
          name="status"
          className={inputClass}
          defaultValue={existingAssignment?.status ?? 'active'}
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create Assignment'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
