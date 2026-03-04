'use client';

import { useState } from 'react';
import { UserManagementTable } from './UserManagementTable';
import { AdminUserActions } from './AdminUserActions';
import type { User, AshbyRole, SourcerRoleAssignment } from '@/lib/types';

interface Req {
  id: string;
  title: string;
}

interface AdminUsersClientProps {
  initialUsers: User[];
  ashbyRoles: AshbyRole[];
  reqs: Req[];
  initialAssignments: SourcerRoleAssignment[];
}

export function AdminUsersClient({
  initialUsers,
  ashbyRoles,
  reqs,
  initialAssignments,
}: AdminUsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const leads = users.filter((u) => u.role === 'lead' || u.role === 'admin');

  function handleUserCreated(user: User) {
    setUsers((prev) => [...prev, user]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{users.length} total users</p>
        <AdminUserActions leads={leads} onUserCreated={handleUserCreated} />
      </div>

      <UserManagementTable
        initialUsers={users}
        ashbyRoles={ashbyRoles}
        reqs={reqs}
        initialAssignments={initialAssignments}
      />
    </div>
  );
}
