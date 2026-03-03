'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { getWeekStartDate } from '@/lib/utils/helpers';

interface SnapshotButtonProps {
  weekStart: string;
}

export function SnapshotButton({ weekStart }: SnapshotButtonProps) {
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentWeek = getWeekStartDate(new Date()).toISOString().split('T')[0];
  if (weekStart !== currentWeek) return null;

  async function handleSave() {
    setPending(true);
    try {
      const res = await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleSave} disabled={pending || saved}>
      {saved ? '✓ Snapshot Saved' : pending ? 'Saving...' : 'Save Snapshot'}
    </Button>
  );
}
