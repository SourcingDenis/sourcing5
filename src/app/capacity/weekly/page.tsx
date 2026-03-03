export const dynamic = 'force-dynamic';

import { getUsersLoadForWeek } from '@/lib/data/capacity';
import { getWeekStartDate } from '@/lib/utils/helpers';
import { snapshotsRepository } from '@/lib/db/repositories/snapshots';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { TeamLoadTable } from '@/components/dashboard/TeamLoadTable';
import { WeekPicker } from '@/components/capacity/WeekPicker';
import { SnapshotButton } from '@/components/capacity/SnapshotButton';
import { formatCapacityHours } from '@/lib/utils/formatting';

interface PageProps {
  searchParams: { week?: string };
}

export default async function WeeklyPage({ searchParams }: PageProps) {
  const weekStart =
    searchParams.week ?? getWeekStartDate(new Date()).toISOString().split('T')[0];

  const [usersLoad, snapshots] = await Promise.all([
    getUsersLoadForWeek(weekStart),
    snapshotsRepository.listSnapshotsByWeek(weekStart),
  ]);

  const isSnapshot = snapshots.length > 0;
  const totalCapacity = usersLoad.reduce((s, ul) => s + ul.user.weeklyCapacityHours, 0);
  const totalAllocated = usersLoad.reduce((s, ul) => s + ul.assignedHours, 0);
  const totalAvailable = Math.max(totalCapacity - totalAllocated, 0);

  const currentWeek = getWeekStartDate(new Date()).toISOString().split('T')[0];
  const isCurrentWeek = weekStart === currentWeek;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Weekly Capacity</h1>
          <p className="mt-2 text-slate-600">
            {isSnapshot ? 'Showing persisted snapshot' : 'Showing live data'}
            {isCurrentWeek && ' · Current week'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SnapshotButton weekStart={weekStart} />
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <WeekPicker currentWeekStart={weekStart} />
        {isSnapshot && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            Saved snapshot
          </span>
        )}
      </div>

      {/* Capacity summary for the week */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Team Capacity</CardDescription>
            <CardTitle>{formatCapacityHours(totalCapacity)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Allocated</CardDescription>
            <CardTitle>{formatCapacityHours(totalAllocated)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Available</CardDescription>
            <CardTitle>{formatCapacityHours(totalAvailable)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Weekly load table */}
      <Card>
        <CardHeader>
          <CardTitle>Load for Week of {weekStart}</CardTitle>
          <CardDescription>
            {isSnapshot
              ? `Snapshot saved on ${new Date(snapshots[0]?.createdAt ?? weekStart).toLocaleDateString()}`
              : 'Live data — save a snapshot to preserve this view'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamLoadTable loads={usersLoad} defaultSort="loadRatio" />
        </CardContent>
      </Card>
    </div>
  );
}
