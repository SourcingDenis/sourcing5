'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface SyncResult {
  synced: number;
  total: number;
}

interface AshbyRoleSyncButtonProps {
  onSynced?: () => void;
}

export function AshbyRoleSyncButton({ onSynced }: AshbyRoleSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState('');

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    setError('');

    try {
      const res = await fetch('/api/admin/ashby/sync-roles', { method: 'POST' });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Sync failed');
        return;
      }

      setResult(json.data);
      onSynced?.();
    } catch {
      setError('Network error during sync');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
        {syncing ? 'Syncing…' : 'Sync Ashby Departments'}
      </Button>

      {result && (
        <span className="text-sm text-green-700">
          Synced {result.synced} department(s)
        </span>
      )}

      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
    </div>
  );
}
