'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { oneOnOneRoutes } from '@/modules/one-on-one/routes';
import type { OneOnOne } from '@/lib/types';

interface User {
  id: string;
  name: string;
}

interface OneOnOneFormProps {
  managerId: string;
  reports: User[];
  existing?: OneOnOne;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OneOnOneForm({
  managerId,
  reports,
  existing,
  onSuccess,
  onCancel,
}: OneOnOneFormProps) {
  const [reportId, setReportId]       = useState(existing?.reportId ?? reports[0]?.id ?? '');
  const [scheduledAt, setScheduledAt] = useState(
    existing?.scheduledAt
      ? existing.scheduledAt.slice(0, 16)  // trim to datetime-local format
      : ''
  );
  const [summary, setSummary]         = useState(existing?.summary ?? '');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const body = {
      managerId,
      reportId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      summary: summary || undefined,
    };

    try {
      const url    = existing ? oneOnOneRoutes.api.detail(existing.id) : oneOnOneRoutes.api.list;
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
          Report
        </label>
        <select
          value={reportId}
          onChange={(e) => setReportId(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          {reports.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Scheduled At
        </label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Summary <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          placeholder="Key notes or outcomes from this 1:1…"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Saving…' : existing ? 'Update 1:1' : 'Schedule 1:1'}
        </Button>
      </div>
    </form>
  );
}
