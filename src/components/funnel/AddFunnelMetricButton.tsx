'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FunnelMetricForm } from './FunnelMetricForm';
import type { User, Req } from '@/lib/types';

interface AddFunnelMetricButtonProps {
  users: User[];
  reqs: Req[];
}

export function AddFunnelMetricButton({ users, reqs }: AddFunnelMetricButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        + Add Metrics
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Log Weekly Funnel Metrics"
      >
        <FunnelMetricForm
          users={users}
          reqs={reqs}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
