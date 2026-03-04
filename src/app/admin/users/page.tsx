export const dynamic = 'force-dynamic';

import { usersRepository } from '@/lib/db/repositories/users';
import { reqsRepository } from '@/lib/db/repositories/reqs';
import { ashbyRolesRepository, sourcerRoleAssignmentsRepository } from '@/lib/db/repositories/adminRoles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { AdminUsersClient } from '@/components/admin/AdminUsersClient';
import { AshbyRoleSyncButton } from '@/components/admin/AshbyRoleSyncButton';

export default async function AdminUsersPage() {
  const [users, reqs, ashbyRoles, assignments] = await Promise.all([
    usersRepository.listUsers(),
    reqsRepository.listReqs(),
    ashbyRolesRepository.listAll(),
    sourcerRoleAssignmentsRepository.listAll(),
  ]);

  const reqsForSelect = reqs.map((r) => ({ id: r.id, title: r.title }));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="mt-2 text-slate-600">
            Create sourcers, manage access, and assign them to roles or requisitions.
          </p>
        </div>
      </div>

      {/* Ashby sync card */}
      <Card>
        <CardHeader>
          <CardTitle>Ashby Departments</CardTitle>
          <CardDescription>
            Sync departments from Ashby first, then assign sourcers to them below.
            {ashbyRoles.length > 0 && (
              <span className="ml-1 text-slate-700">
                {ashbyRoles.length} department(s) loaded.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AshbyRoleSyncButton />
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Create new sourcers and manage their access and role assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminUsersClient
            initialUsers={users}
            ashbyRoles={ashbyRoles}
            reqs={reqsForSelect}
            initialAssignments={assignments}
          />
        </CardContent>
      </Card>
    </div>
  );
}
