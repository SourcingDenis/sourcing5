'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { funnelRoutes } from '@/modules/funnel';
import type { AshbySyncResult } from '@/lib/types';

export function AshbySyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AshbySyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(funnelRoutes.api.sync, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Sync failed');
        return;
      }

      setResult(json.data as AshbySyncResult);
      router.refresh();
    } catch {
      setError('Network error during sync');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="sm" onClick={handleSync} disabled={loading}>
        {loading ? 'Syncing...' : 'Sync Ashby'}
      </Button>

      {result && (
        <p className="text-xs text-slate-600">
          Synced {result.synced} jobs.
          {result.errors.length > 0 && (
            <span className="ml-1 text-red-600">{result.errors.length} error(s).</span>
          )}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
