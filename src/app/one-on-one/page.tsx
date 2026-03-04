export const dynamic = 'force-dynamic';

import { usersRepository } from '@/lib/db/repositories/users';
import { oneOnOnesRepository } from '@/lib/db/repositories/oneOnOnes';
import { actionItemsRepository } from '@/lib/db/repositories/actionItems';
import { getManagerDashboardStats } from '@/lib/data/oneOnOne';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardStatsCards } from '@/components/one-on-one/DashboardStatsCards';
import { AgingActionItemAlert } from '@/components/one-on-one/AgingActionItemAlert';
import { OneOnOneList } from '@/components/one-on-one/OneOnOneList';
import { ScheduleOneOnOneButton } from '@/components/one-on-one/ScheduleOneOnOneButton';
import type { OneOnOneWithParticipants } from '@/lib/types';

export default async function OneOnOnePage() {
  // Load all users to determine the lead (manager) and their direct reports
  const allUsers = await usersRepository.listUsers();
  const manager  = allUsers.find((u) => u.role === 'lead');

  if (!manager) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">OneOnOne Engine</h1>
          <p className="mt-2 text-slate-600">No lead user found. Set up your team first.</p>
        </div>
      </div>
    );
  }

  const managerId = manager.id;
  const reports   = allUsers.filter((u) => u.managerId === managerId);

  // Parallel data fetch
  const [ones, stats] = await Promise.all([
    oneOnOnesRepository.listByManagerWithParticipants(managerId),
    getManagerDashboardStats(managerId),
  ]);

  // Get open action item count per report for the table badge
  const openItemsByReport = await Promise.all(
    reports.map((r) => actionItemsRepository.listOpenByOwner(r.id))
  );
  const openCountMap: Record<string, number> = {};
  reports.forEach((r, i) => {
    openCountMap[r.id] = openItemsByReport[i].length;
  });

  // Enrich 1:1 list with open action item counts
  const enrichedOnes: OneOnOneWithParticipants[] = ones.map((o) => ({
    ...o,
    openActionItemCount: openCountMap[o.reportId] ?? 0,
  }));

  // Build report name map for aging alert
  const reportNameMap: Record<string, string> = {};
  allUsers.forEach((u) => { reportNameMap[u.id] = u.name; });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">OneOnOne Engine</h1>
          <p className="mt-2 text-slate-600">
            Schedule, track, and action 1:1 meetings for {manager.name}&apos;s team
          </p>
        </div>
        <ScheduleOneOnOneButton managerId={managerId} reports={reports} />
      </div>

      {/* KPI Dashboard */}
      <DashboardStatsCards stats={stats} />

      {/* Aging action items alert */}
      {stats.agingCount > 0 && (
        <AgingActionItemAlert
          items={stats.agingActionItems}
          reportNames={reportNameMap}
        />
      )}

      {/* 1:1 list */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled 1:1s</CardTitle>
          <CardDescription>
            {enrichedOnes.length} session{enrichedOnes.length !== 1 ? 's' : ''} total
            · Click &ldquo;View agenda&rdquo; to see auto-generated suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OneOnOneList ones={enrichedOnes} />
        </CardContent>
      </Card>
    </div>
  );
}
