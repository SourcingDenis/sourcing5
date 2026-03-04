export const dynamic = 'force-dynamic';

import { getTeamFunnelSummary } from '@/lib/data/funnel';
import { usersRepository } from '@/lib/db/repositories/users';
import { reqsRepository } from '@/lib/db/repositories/reqs';
import { settingsRepository } from '@/lib/db/repositories/settings';
import { getWeekStartDate } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/formatting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FunnelSummaryTable } from '@/components/funnel/FunnelSummaryTable';
import { FunnelAlertList } from '@/components/funnel/FunnelAlertList';
import { AshbySyncButton } from '@/components/funnel/AshbySyncButton';
import { AddFunnelMetricButton } from '@/components/funnel/AddFunnelMetricButton';
import type { FunnelAlert } from '@/lib/types';

export default async function FunnelPage() {
  const weekStr = getWeekStartDate().toISOString().split('T')[0];

  const [summary, users, reqs, apiKeySetting] = await Promise.all([
    getTeamFunnelSummary(weekStr),
    usersRepository.listUsers(),
    reqsRepository.listOpenReqs(),
    settingsRepository.getByKey('ashby_api_key'),
  ]);

  const isAshbyConfigured = Boolean(apiKeySetting?.value?.trim());

  const allAlerts: FunnelAlert[] = summary.sourcerSummaries
    .flatMap((s) => s.metrics)
    .flatMap((m) => m.alerts);

  const redCount     = allAlerts.filter((a) => a.severity === 'red').length;
  const warningCount = allAlerts.filter((a) => a.severity === 'warning').length;
  const flagCount    = allAlerts.filter((a) => a.severity === 'flag').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Funnel Radar</h1>
          <p className="mt-2 text-slate-600">
            Week of {formatDate(weekStr)} — sourcing pipeline health
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAshbyConfigured ? (
            <AshbySyncButton />
          ) : (
            <a
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100"
            >
              Configure Ashby →
            </a>
          )}
          <AddFunnelMetricButton users={users} reqs={reqs} />
        </div>
      </div>

      {/* Ashby not configured banner */}
      {!isAshbyConfigured && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Ashby not connected.</strong>{' '}
          <a href="/settings" className="underline hover:text-amber-900">
            Add your Ashby API key in Settings
          </a>{' '}
          to enable automatic screens booked sync.
        </div>
      )}

      {/* Top-level metric cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Outreach</CardDescription>
            <CardTitle>{summary.totalOutreach}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Team Reply Rate</CardDescription>
            <CardTitle>{(summary.avgReplyRate * 100).toFixed(0)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="text-red-600">Critical Alerts</CardDescription>
            <CardTitle className="text-red-600">{redCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Warnings / Flags</CardDescription>
            <CardTitle className="text-yellow-600">{warningCount + flagCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Active alerts */}
      {allAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>Issues requiring attention this week</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelAlertList alerts={allAlerts} />
          </CardContent>
        </Card>
      )}

      {/* Per-sourcer summary table */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Sourcer Summary</CardTitle>
          <CardDescription>
            {summary.sourcerSummaries.length} sourcer(s) reporting metrics this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FunnelSummaryTable summaries={summary.sourcerSummaries} />
        </CardContent>
      </Card>
    </div>
  );
}
