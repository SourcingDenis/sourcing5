'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { User, AshbyRole, SourcerRoleAssignment } from '@/lib/types';

interface Req {
  id: string;
  title: string;
}

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  ashbyRoles: AshbyRole[];
  reqs: Req[];
  existingAssignments: SourcerRoleAssignment[];
  onAssigned: (assignment: SourcerRoleAssignment) => void;
  onUnassigned: (assignmentId: string) => void;
}

export function AssignRoleModal({
  isOpen,
  onClose,
  user,
  ashbyRoles,
  reqs,
  existingAssignments,
  onAssigned,
  onUnassigned,
}: AssignRoleModalProps) {
  const [tab, setTab] = useState<'ashby' | 'req'>('req');
  const [selectedReqId, setSelectedReqId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload =
      tab === 'req'
        ? { userId: user.id, reqId: selectedReqId, notes: notes.trim() || undefined }
        : { userId: user.id, ashbyRoleId: selectedRoleId, notes: notes.trim() || undefined };

    try {
      const res = await fetch('/api/admin/role-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to assign');
        return;
      }
      onAssigned(json.data);
      setSelectedReqId('');
      setSelectedRoleId('');
      setNotes('');
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    setRemoving(id);
    try {
      await fetch(`/api/admin/role-assignments/${id}`, { method: 'DELETE' });
      onUnassigned(id);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign role — ${user.name}`} className="max-w-xl">
      {/* Existing assignments */}
      {existingAssignments.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Current assignments
          </p>
          <ul className="space-y-1">
            {existingAssignments.map((a) => {
              const label =
                a.reqId
                  ? reqs.find((r) => r.id === a.reqId)?.title ?? a.reqId
                  : ashbyRoles.find((r) => r.id === a.ashbyRoleId)?.name ?? a.ashbyRoleId ?? '—';
              return (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="text-slate-800">{label}</span>
                  <button
                    onClick={() => handleRemove(a.id)}
                    disabled={removing === a.id}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    {removing === a.id ? 'Removing…' : 'Remove'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab('req')}
          className={`pb-2 text-sm font-medium transition-colors ${
            tab === 'req'
              ? 'border-b-2 border-slate-900 text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Requisition
        </button>
        <button
          onClick={() => setTab('ashby')}
          className={`pb-2 text-sm font-medium transition-colors ${
            tab === 'ashby'
              ? 'border-b-2 border-slate-900 text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Ashby Department
        </button>
      </div>

      <form onSubmit={handleAssign} className="space-y-3">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {tab === 'req' ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Requisition</label>
            <select
              required
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="">Select a requisition…</option>
              {reqs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.id})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Ashby Department
            </label>
            {ashbyRoles.length === 0 ? (
              <p className="text-sm text-slate-500">
                No Ashby departments synced yet. Sync them first on the Admin page.
              </p>
            ) : (
              <select
                required
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="">Select a department…</option>
                {ashbyRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this assignment"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={submitting || (tab === 'ashby' && ashbyRoles.length === 0)}
          >
            {submitting ? 'Assigning…' : 'Assign'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
