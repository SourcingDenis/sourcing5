'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AssignRoleModal } from './AssignRoleModal';
import type { User, AshbyRole, SourcerRoleAssignment } from '@/lib/types';

interface Req {
  id: string;
  title: string;
}

const ROLE_LABELS: Record<string, string> = {
  sourcer: 'Sourcer',
  lead: 'Lead',
  admin: 'Admin',
};

const ROLE_COLORS: Record<string, string> = {
  sourcer: 'bg-blue-100 text-blue-700',
  lead: 'bg-purple-100 text-purple-700',
  admin: 'bg-amber-100 text-amber-700',
};

interface UserManagementTableProps {
  initialUsers: User[];
  ashbyRoles: AshbyRole[];
  reqs: Req[];
  initialAssignments: SourcerRoleAssignment[];
}

export function UserManagementTable({
  initialUsers,
  ashbyRoles,
  reqs,
  initialAssignments,
}: UserManagementTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [assignments, setAssignments] = useState<SourcerRoleAssignment[]>(initialAssignments);
  const [assignModalUser, setAssignModalUser] = useState<User | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function toggleActive(user: User) {
    setTogglingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const json = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? json.data : u)));
      }
    } finally {
      setTogglingId(null);
      setConfirmDeactivate(null);
    }
  }

  function userAssignments(userId: string) {
    return assignments.filter((a) => a.userId === userId);
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Capacity</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Assignments</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const ua = userAssignments(user.id);
              return (
                <tr key={user.id} className={user.isActive ? '' : 'opacity-50'}>
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role] ?? 'bg-slate-100 text-slate-600'}`}
                    >
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.weeklyCapacityHours}h/wk</td>
                  <td className="px-4 py-3">
                    {ua.length === 0 ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <span className="text-slate-700">{ua.length} role(s)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAssignModalUser(user)}
                      >
                        Assign role
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={togglingId === user.id}
                        onClick={() =>
                          user.isActive
                            ? setConfirmDeactivate(user)
                            : toggleActive(user)
                        }
                      >
                        {togglingId === user.id
                          ? '…'
                          : user.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Deactivate confirmation */}
      <Modal
        isOpen={Boolean(confirmDeactivate)}
        onClose={() => setConfirmDeactivate(null)}
        title="Deactivate user"
      >
        <p className="mb-6 text-sm text-slate-600">
          Are you sure you want to deactivate{' '}
          <strong>{confirmDeactivate?.name}</strong>? They will lose access to the system.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setConfirmDeactivate(null)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            onClick={() => confirmDeactivate && toggleActive(confirmDeactivate)}
          >
            Deactivate
          </Button>
        </div>
      </Modal>

      {/* Assign role modal */}
      {assignModalUser && (
        <AssignRoleModal
          isOpen={true}
          onClose={() => setAssignModalUser(null)}
          user={assignModalUser}
          ashbyRoles={ashbyRoles}
          reqs={reqs}
          existingAssignments={userAssignments(assignModalUser.id)}
          onAssigned={(a) => setAssignments((prev) => [...prev, a])}
          onUnassigned={(id) => setAssignments((prev) => prev.filter((a) => a.id !== id))}
        />
      )}
    </>
  );
}
