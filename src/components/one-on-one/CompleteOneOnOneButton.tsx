'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { oneOnOneRoutes } from '@/modules/one-on-one/routes';

interface CompleteOneOnOneButtonProps {
  oneOnOneId: string;
  isCompleted: boolean;
}

export function CompleteOneOnOneButton({ oneOnOneId, isCompleted }: CompleteOneOnOneButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isCompleted) {
    return (
      <span className="text-xs text-slate-400">Done</span>
    );
  }

  async function handleComplete() {
    setError(null);
    try {
      const res = await fetch(oneOnOneRoutes.api.complete(oneOnOneId), {
        method: 'POST',
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? 'Failed to complete');
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError('Network error');
    }
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleComplete}
        disabled={isPending}
      >
        {isPending ? 'Saving…' : 'Mark complete'}
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
