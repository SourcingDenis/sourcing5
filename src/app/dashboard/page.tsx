export const dynamic = 'force-dynamic';

import { getAllUsersLoad } from '@/lib/data/capacity';
import { assignmentsRepository } from '@/lib/db/repositories/assignments';
import { reqsRepository } from '@/lib/db/repositories/reqs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { TeamLoadTable } from '@/components/dashboard/TeamLoadTable';
import { LoadIndicator } from '@/components/ui/LoadIndicator';
import { formatCapacityHours, formatLoadRatio, formatDate } from '@/lib/utils/formatting';

export default async function DashboardPage() {
  const [usersLoad, activeAssignments, openReqs] = await Promise.all([
    getAllUsersLoad(),
    assignmentsRepository.listActiveAssignments(),
    reqsRepository.listOpenReqs(),
  ]);

  const sourcers = usersLoad.filter((ul) => ul.user.role === 'sourcer');
  const allMembers = usersLoad;

  const totalCapacity = allMembers.reduce((s, ul) => s + ul.user.weeklyCapacityHours, 0);
  const totalAllocated = allMembers.reduce((s, ul) => s + ul.assignedHours, 0);
  const avgLoad =
    sourcers.length > 0
      ? sourcers.reduce((s, ul) => s + ul.loadRatio, 0) / sourcers.length
      : 0;

  const overloaded = allMembers.filter((ul) => ul.loadRatio > 1.0).length;
  const atRisk = allMembers.filter((ul) => ul.loadRatio >= 0.8 && ul.loadRatio <= 1.0).length;
  const healthy = allMembers.filter((ul) => ul.loadRatio < 0.8).length;

  // Latest 5 active assignments with sourcer name lookup
  const recentAssignments = activeAssignments.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Capacity OS</h1>
        <p className="mt-2 text-slate-600">Workload dashboard for the sourcing team</p>
      </div>

      {/* Top-level metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Team Members</CardDescription>
            <CardTitle>{allMembers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Open Reqs</CardDescription>
            <CardTitle>{openReqs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active Assignments</CardDescription>
            <CardTitle>{activeAssignments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg Sourcer Load</CardDescription>
            <CardTitle>
              <LoadIndicator loadRatio={avgLoad} size="md" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Capacity risk breakdown */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Overloaded (&gt; 100%)</CardDescription>
            <CardTitle className="text-red-600">{overloaded}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              {overloaded === 0 ? 'No one over capacity' : `${overloaded} member(s) need reassignment`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>At Risk (80–100%)</CardDescription>
            <CardTitle className="text-yellow-600">{atRisk}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              {atRisk === 0 ? 'No one at risk' : `${atRisk} member(s) near capacity`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Available (&lt; 80%)</CardDescription>
            <CardTitle className="text-green-600">{healthy}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              {formatCapacityHours(Math.max(totalCapacity - totalAllocated, 0))} hrs available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Manager view: full sortable team table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Load — Manager View</CardTitle>
          <CardDescription>
            {formatCapacityHours(totalCapacity)} total capacity ·{' '}
            {formatCapacityHours(totalAllocated)} allocated ·{' '}
            {formatLoadRatio(totalCapacity > 0 ? totalAllocated / totalCapacity : 0)} overall
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamLoadTable loads={usersLoad} defaultSort="loadRatio" />
        </CardContent>
      </Card>

      {/* Recent assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Active Assignments</CardTitle>
          <CardDescription>Latest staffing activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAssignments.length === 0 ? (
            <p className="text-sm text-slate-500">No active assignments yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAssignments.map((a) => {
                const sourcer = usersLoad.find((ul) => ul.user.id === a.userId);
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-2"
                  >
                    <div>
                      <span className="font-medium text-slate-900">
                        {sourcer?.user.name ?? 'Unknown'}
                      </span>
                      <span className="mx-2 text-slate-400">→</span>
                      <span className="font-mono text-xs text-slate-600">{a.reqId}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-600">
                        {a.estimatedHoursPerWeek}h / wk
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(a.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
