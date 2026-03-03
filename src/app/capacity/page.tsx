export const dynamic = 'force-dynamic';

import { getAllUsersLoad, getAllAssignmentsWithDetails } from '@/lib/data/capacity';
import { usersRepository } from '@/lib/db/repositories/users';
import { reqsRepository } from '@/lib/db/repositories/reqs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AssignmentTable } from '@/components/capacity/AssignmentTable';
import { AddAssignmentButton } from '@/components/capacity/AddAssignmentButton';
import { TeamLoadTable } from '@/components/dashboard/TeamLoadTable';
import { formatCapacityHours } from '@/lib/utils/formatting';

export default async function CapacityPage() {
  const [rawAssignments, users, reqs, usersLoad] = await Promise.all([
    getAllAssignmentsWithDetails(),
    usersRepository.listUsers(),
    reqsRepository.listOpenReqs(),
    getAllUsersLoad(),
  ]);

  const totalCapacity = usersLoad.reduce((s, ul) => s + ul.user.weeklyCapacityHours, 0);
  const totalAllocated = usersLoad.reduce((s, ul) => s + ul.assignedHours, 0);
  const totalAvailable = Math.max(totalCapacity - totalAllocated, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Capacity Management</h1>
          <p className="mt-2 text-slate-600">Manage assignments and track allocation</p>
        </div>
        <AddAssignmentButton users={users} reqs={reqs} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Capacity</CardDescription>
            <CardTitle>{formatCapacityHours(totalCapacity)} / week</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Allocated</CardDescription>
            <CardTitle>{formatCapacityHours(totalAllocated)} / week</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Available</CardDescription>
            <CardTitle>{formatCapacityHours(totalAvailable)} / week</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Per-person load */}
      <Card>
        <CardHeader>
          <CardTitle>Current Load by Person</CardTitle>
          <CardDescription>Live active assignment hours</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamLoadTable loads={usersLoad} defaultSort="loadRatio" />
        </CardContent>
      </Card>

      {/* Assignment list */}
      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>{rawAssignments.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentTable assignments={rawAssignments} users={users} reqs={reqs} />
        </CardContent>
      </Card>
    </div>
  );
}
