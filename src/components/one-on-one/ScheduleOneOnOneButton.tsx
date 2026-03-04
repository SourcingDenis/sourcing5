'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { OneOnOneForm } from './OneOnOneForm';

interface User {
  id: string;
  name: string;
}

interface ScheduleOneOnOneButtonProps {
  managerId: string;
  reports: User[];
}

export function ScheduleOneOnOneButton({ managerId, reports }: ScheduleOneOnOneButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        + Schedule 1:1
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Schedule a 1:1"
      >
        <OneOnOneForm
          managerId={managerId}
          reports={reports}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
