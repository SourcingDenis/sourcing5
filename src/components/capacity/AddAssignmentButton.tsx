'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AssignmentForm } from './AssignmentForm';
import type { User, Req } from '@/lib/types';

interface AddAssignmentButtonProps {
  users: User[];
  reqs: Req[];
}

export function AddAssignmentButton({ users, reqs }: AddAssignmentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add Assignment</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="New Assignment">
        <AssignmentForm
          users={users}
          reqs={reqs}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
