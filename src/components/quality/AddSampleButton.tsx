'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { User, Req } from '@/lib/types';

interface AddSampleButtonProps {
  users: User[];
  reqs: Req[];
}

export function AddSampleButton({ users, reqs }: AddSampleButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen]     = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError]       = useState<string | null>(null);

  const [userId, setUserId]         = useState('');
  const [reqId, setReqId]           = useState('');
  const [messageText, setMessage]   = useState('');

  function reset() {
    setUserId('');
    setReqId('');
    setMessage('');
    setError(null);
  }

  function handleClose() {
    setIsOpen(false);
    reset();
  }

  async function handleSubmit() {
    if (!userId) { setError('Select a sourcer'); return; }
    if (!reqId)  { setError('Select a req'); return; }
    if (messageText.trim().length < 10) { setError('Message must be at least 10 characters'); return; }

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/quality/samples', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, reqId, messageText: messageText.trim() }),
        });

        if (!res.ok) {
          const json = await res.json();
          setError(json.error ?? 'Failed to add sample');
          return;
        }

        router.refresh();
        handleClose();
      } catch {
        setError('Unexpected error. Please try again.');
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)}>
        + Add Sample
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Add Outreach Sample">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Sourcer
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">Select sourcer…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Requisition
            </label>
            <select
              value={reqId}
              onChange={(e) => setReqId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">Select req…</option>
              {reqs.map((r) => (
                <option key={r.id} value={r.id}>{r.title} ({r.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Message Text
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Paste the outreach message here…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Adding…' : 'Add Sample'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
