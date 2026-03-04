export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { usersRepository } from '@/lib/db/repositories/users';
import { ashbyRolesRepository } from '@/lib/db/repositories/adminRoles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { AshbyRoleSyncButton } from '@/components/admin/AshbyRoleSyncButton';

export default async function AdminPage() {
  const [users, ashbyRoles] = await Promise.all([
    usersRepository.listUsers(),
    ashbyRolesRepository.listAll(),
  ]);

  const activeUsers = users.filter((u) => u.isActive);
  const sourcers = users.filter((u) => u.role === 'sourcer');
  const leads = users.filter((u) => u.role === 'lead');
  const admins = users.filter((u) => u.role === 'admin');

  const stats = [
    { label: 'Total users', value: users.length },
    { label: 'Active users', value: activeUsers.length },
    { label: 'Sourcers', value: sourcers.length },
    { label: 'Leads', value: leads.length },
    { label: 'Admins', value: admins.length },
    { label: 'Ashby departments synced', value: ashbyRoles.length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Manage sourcers, access control, and Ashby integrations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Create new sourcers, assign roles, and manage access to the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/users"
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Manage Users →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ashby Department Sync</CardTitle>
            <CardDescription>
              Sync departments from Ashby ATS to use for assigning sourcers to sourcing areas.
              {ashbyRoles.length > 0 && (
                <span className="ml-1 text-slate-700">
                  Last sync: {ashbyRoles.length} department(s) loaded.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AshbyRoleSyncButton />
          </CardContent>
        </Card>
      </div>

      {/* Ashby roles table */}
      {ashbyRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Synced Ashby Departments</CardTitle>
            <CardDescription>Departments available for role assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Last synced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ashbyRoles.map((role) => (
                    <tr key={role.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{role.name}</td>
                      <td className="px-4 py-3 text-slate-500 capitalize">{role.type}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(role.syncedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
