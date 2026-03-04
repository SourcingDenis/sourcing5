import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import type { OneOnOneDashboardStats } from '@/lib/types';

interface DashboardStatsCardsProps {
  stats: OneOnOneDashboardStats;
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  const rate30 = (stats.completionRate30d * 100).toFixed(0);
  const rate90 = (stats.completionRate90d * 100).toFixed(0);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>30-Day Completion Rate</CardDescription>
          <CardTitle
            className={
              stats.completionRate30d >= 0.8
                ? 'text-green-600'
                : stats.completionRate30d >= 0.5
                ? 'text-yellow-600'
                : 'text-red-600'
            }
          >
            {rate30}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            {stats.totalCompleted30d} of {stats.totalScheduled30d} scheduled
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>90-Day Completion Rate</CardDescription>
          <CardTitle
            className={
              stats.completionRate90d >= 0.8
                ? 'text-green-600'
                : stats.completionRate90d >= 0.5
                ? 'text-yellow-600'
                : 'text-red-600'
            }
          >
            {rate90}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            {stats.totalCompleted90d} of {stats.totalScheduled90d} scheduled
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>1:1s This Month</CardDescription>
          <CardTitle>{stats.totalScheduled30d}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            {stats.totalCompleted30d} completed · {stats.totalScheduled30d - stats.totalCompleted30d} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Aging Action Items</CardDescription>
          <CardTitle className={stats.agingCount > 0 ? 'text-red-600' : 'text-green-600'}>
            {stats.agingCount}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            {stats.agingCount === 0
              ? 'No items overdue by > 14 days'
              : `${stats.agingCount} item(s) overdue by > 14 days`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
