'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ActionItemForm } from './ActionItemForm';

interface AddActionItemButtonProps {
  ownerId: string;
  oneOnOneId?: string | null;
}

export function AddActionItemButton({ ownerId, oneOnOneId }: AddActionItemButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        + Add action item
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add Action Item"
      >
        <ActionItemForm
          ownerId={ownerId}
          oneOnOneId={oneOnOneId}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
