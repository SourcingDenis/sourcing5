'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { VariantComparisonTable } from './VariantComparisonTable';
import { AddVariantModal } from './AddVariantModal';
import { AddResultModal } from './AddResultModal';
import { experimentsRoutes } from '@/modules/experiments/routes';
import type { ExperimentWithStats } from '@/modules/experiments/types';

interface ExperimentDetailClientProps {
  experiment: ExperimentWithStats;
}

interface AddResultState {
  variantId:   string;
  variantName: string;
}

export function ExperimentDetailClient({ experiment }: ExperimentDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddVariant,  setShowAddVariant]  = useState(false);
  const [addResultState,  setAddResultState]  = useState<AddResultState | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [completeError,   setCompleteError]   = useState<string | null>(null);

  const isActive = experiment.status === 'active';

  function handleAddResult(variantId: string, variantName: string) {
    setAddResultState({ variantId, variantName });
  }

  async function handleMarkComplete() {
    if (!window.confirm('Mark this experiment as completed? This will close it for new data entry.')) {
      return;
    }
    setMarkingComplete(true);
    setCompleteError(null);

    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(experimentsRoutes.api.detail(experiment.id), {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: 'completed', endDate: today }),
    });

    setMarkingComplete(false);
    if (!res.ok) {
      const data = await res.json();
      setCompleteError(data.error ?? 'Failed to update status');
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <>
      {isActive && (
        <div className="mb-4 flex items-center gap-3">
          <Button onClick={() => setShowAddVariant(true)} variant="secondary">
            + Add Variant
          </Button>
          <Button
            onClick={handleMarkComplete}
            variant="outline"
            disabled={markingComplete || isPending}
          >
            {markingComplete ? 'Updating...' : 'Mark as Completed'}
          </Button>
        </div>
      )}

      {completeError && (
        <p className="mb-3 text-sm text-red-600">{completeError}</p>
      )}

      <VariantComparisonTable
        variants={experiment.variants}
        canEdit={isActive}
        onAddResult={handleAddResult}
      />

      <AddVariantModal
        isOpen={showAddVariant}
        onClose={() => setShowAddVariant(false)}
        experimentId={experiment.id}
      />

      {addResultState && (
        <AddResultModal
          key={addResultState.variantId}
          isOpen={true}
          onClose={() => setAddResultState(null)}
          experimentId={experiment.id}
          variantId={addResultState.variantId}
          variantName={addResultState.variantName}
        />
      )}
    </>
  );
}
