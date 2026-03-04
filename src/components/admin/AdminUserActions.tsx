'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CreateSourcerForm } from './CreateSourcerForm';
import type { User } from '@/lib/types';

interface AdminUserActionsProps {
  leads: User[];
  onUserCreated: (user: User) => void;
}

export function AdminUserActions({ leads, onUserCreated }: AdminUserActionsProps) {
  const [showModal, setShowModal] = useState(false);

  function handleSuccess(user: User) {
    onUserCreated(user);
    setShowModal(false);
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)} size="sm">
        + Add Sourcer
      </Button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add new sourcer">
        <CreateSourcerForm
          leads={leads}
          onSuccess={handleSuccess}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </>
  );
}
