export const dynamic = 'force-dynamic';

import { getAllUsersLoad, getAllAssignmentsWithDetails } from '@/lib/data/capacity';
import { getTeamFunnelSummary, getSourcerFunnelHealthBadges } from '@/lib/data/funnel';
import { getTeamQualitySummary } from '@/lib/data/quality';
import { getAllExperimentsWithStats } from '@/modules/experiments/service';
import { reqsRepository } from '@/lib/db/repositories/reqs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { TeamLoadTable } from '@/components/dashboard/TeamLoadTable';
import { LoadIndicator } from '@/components/ui/LoadIndicator';
import { formatCapacityHours, formatLoadRatio, formatDate } from '@/lib/utils/formatting';

export default async function DashboardPage() {
  const [
    usersLoad,
    allAssignments,
    openReqs,
    funnelHealth,
    funnelSummary,
    qualitySummary,
    experiments,
  ] = await Promise.all([
    getAllUsersLoad(),
    getAllAssignmentsWithDetails(),
    reqsRepository.listOpenReqs(),
    getSourcerFunnelHealthBadges(),
    getTeamFunnelSummary(),
    getTeamQualitySummary(),
    getAllExperimentsWithStats(),
  ]);

  const recentAssignments = allAssignments.filter((a) => a.status === 'active').slice(0, 5);
  const activeAssignmentCount = allAssignments.filter((a) => a.status === 'active').length;

  const allMembers = usersLoad;
  const sourcers = usersLoad.filter((ul) => ul.user.role === 'sourcer');

  const totalCapacity = allMembers.reduce((s, ul) => s + ul.user.weeklyCapacityHours, 0);
  const totalAllocated = allMembers.reduce((s, ul) => s + ul.assignedHours, 0);
  const avgLoad =
    sourcers.length > 0
      ? sourcers.reduce((s, ul) => s + ul.loadRatio, 0) / sourcers.length
      : 0;

  const overloaded = allMembers.filter((ul) => ul.loadRatio > 1.0).length;
  const atRisk = allMembers.filter((ul) => ul.loadRatio >= 0.8 && ul.loadRatio <= 1.0).length;
  const available = allMembers.filter((ul) => ul.loadRatio < 0.8).length;

  const funnelRedAlerts = funnelSummary.sourcerSummaries
    .flatMap((s) => s.metrics)
    .flatMap((m) => m.alerts)
    .filter((a) => a.severity === 'red').length;

  const activeExperiments = experiments.filter((e) => e.status === 'active').length;

  // Module card style helpers
  function funnelCardStyle() {
    if (funnelRedAlerts > 0) return 'border-red-200 bg-red-50';
    if (funnelSummary.avgReplyRate < 0.2 && funnelSummary.totalOutreach > 0)
      return 'border-amber-200 bg-amber-50';
    if (funnelSummary.totalOutreach === 0) return 'border-slate-200 bg-slate-50';
    return 'border-emerald-200 bg-emerald-50';
  }

  function qualityCardStyle() {
    if (qualitySummary.decliningCount > 1) return 'border-amber-200 bg-amber-50';
    if (qualitySummary.samplesThisWeek === 0) return 'border-slate-200 bg-slate-50';
    return 'border-emerald-200 bg-emerald-50';
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Team Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Overview of capacity, pipeline health, and team performance
        </p>
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
            <CardTitle>{activeAssignmentCount}</CardTitle>
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

      {/* Module status row */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Module Status</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Funnel Radar */}
          <a href="/funnel" className="group block">
            <div
              className={`rounded-lg border p-5 transition-shadow hover:shadow-md ${funnelCardStyle()}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Funnel Radar
                </span>
                {funnelRedAlerts > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                    {funnelRedAlerts} alert{funnelRedAlerts > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-800">
                {funnelSummary.totalOutreach > 0
                  ? `${(funnelSummary.avgReplyRate * 100).toFixed(0)}%`
                  : '—'}
              </p>
              <p className="text-xs text-slate-600">
                team reply rate · {funnelSummary.totalOutreach} sent this week
              </p>
              <p className="mt-3 text-xs text-slate-400 group-hover:text-slate-600">View →</p>
            </div>
          </a>

          {/* Quality Lab */}
          <a href="/quality" className="group block">
            <div
              className={`rounded-lg border p-5 transition-shadow hover:shadow-md ${qualityCardStyle()}`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quality Lab
              </span>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-800">
                {qualitySummary.avgTeamScore !== null
                  ? `${qualitySummary.avgTeamScore.toFixed(1)}/5`
                  : '—'}
              </p>
              <p className="text-xs text-slate-600">
                avg quality score · {qualitySummary.risingCount} rising,{' '}
                {qualitySummary.decliningCount} declining
              </p>
              <p className="mt-3 text-xs text-slate-400 group-hover:text-slate-600">View →</p>
            </div>
          </a>

          {/* Experiment Hub */}
          <a href="/experiments" className="group block">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 transition-shadow hover:shadow-md">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Experiment Hub
              </span>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-800">
                {activeExperiments}
              </p>
              <p className="text-xs text-slate-600">
                active experiment{activeExperiments !== 1 ? 's' : ''} · {experiments.length} total
              </p>
              <p className="mt-3 text-xs text-slate-400 group-hover:text-slate-600">View →</p>
            </div>
          </a>

          {/* AI Insights link */}
          <a href="/insights" className="group block">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 transition-shadow hover:shadow-md">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                AI Insights
              </span>
              <p className="mt-2 text-2xl font-bold text-slate-800">Health</p>
              <p className="text-xs text-slate-600">cross-module analysis &amp; recommendations</p>
              <p className="mt-3 text-xs text-slate-400 group-hover:text-slate-600">Open →</p>
            </div>
          </a>
        </div>
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
              {overloaded === 0
                ? 'No one over capacity'
                : `${overloaded} member(s) need reassignment`}
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
            <CardTitle className="text-green-600">{available}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              {formatCapacityHours(Math.max(totalCapacity - totalAllocated, 0))} hrs available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team load table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Load</CardTitle>
          <CardDescription>
            {formatCapacityHours(totalCapacity)} total capacity ·{' '}
            {formatCapacityHours(totalAllocated)} allocated ·{' '}
            {formatLoadRatio(totalCapacity > 0 ? totalAllocated / totalCapacity : 0)} overall
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamLoadTable loads={usersLoad} defaultSort="loadRatio" funnelHealth={funnelHealth} />
        </CardContent>
      </Card>

      {/* Recent active assignments — with req titles */}
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
              {recentAssignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-2"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900">{a.userName}</span>
                    <span className="mx-2 text-slate-400">→</span>
                    <span className="text-sm text-slate-800">{a.reqTitle}</span>
                    <span className="ml-2 font-mono text-xs text-slate-400">({a.reqId})</span>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-4">
                    <span className="text-sm text-slate-600">{a.estimatedHoursPerWeek}h / wk</span>
                    <span className="text-xs text-slate-400">{formatDate(a.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
