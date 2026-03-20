export const dynamic = 'force-dynamic';

import { getInsightsDashboard } from '@/lib/data/insights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ModuleHealth, InsightAlert, ModuleHealthStatus } from '@/lib/types';

// ----------------------------------------------------------------
// Helper utilities
// ----------------------------------------------------------------

function statusColor(status: ModuleHealthStatus): string {
  switch (status) {
    case 'healthy':  return 'text-emerald-600';
    case 'warning':  return 'text-amber-600';
    case 'critical': return 'text-red-600';
    default:         return 'text-slate-400';
  }
}

function statusBg(status: ModuleHealthStatus): string {
  switch (status) {
    case 'healthy':  return 'bg-emerald-50 border-emerald-200';
    case 'warning':  return 'bg-amber-50 border-amber-200';
    case 'critical': return 'bg-red-50 border-red-200';
    default:         return 'bg-slate-50 border-slate-200';
  }
}

function statusDot(status: ModuleHealthStatus): string {
  switch (status) {
    case 'healthy':  return 'bg-emerald-500';
    case 'warning':  return 'bg-amber-400';
    case 'critical': return 'bg-red-500';
    default:         return 'bg-slate-300';
  }
}

function statusLabel(status: ModuleHealthStatus): string {
  switch (status) {
    case 'healthy':  return 'Healthy';
    case 'warning':  return 'Warning';
    case 'critical': return 'Critical';
    default:         return 'No data';
  }
}

function alertRowStyle(level: InsightAlert['level']): string {
  switch (level) {
    case 'critical': return 'bg-red-50 border-red-200 text-red-800';
    case 'warning':  return 'bg-amber-50 border-amber-200 text-amber-800';
    default:         return 'bg-blue-50 border-blue-200 text-blue-800';
  }
}

function alertIconLabel(level: InsightAlert['level']): string {
  switch (level) {
    case 'critical': return '!';
    case 'warning':  return '⚠';
    default:         return 'i';
  }
}

function barColor(status: ModuleHealthStatus): string {
  switch (status) {
    case 'critical': return 'bg-red-500';
    case 'warning':  return 'bg-amber-400';
    case 'no_data':  return 'bg-slate-300';
    default:         return 'bg-emerald-500';
  }
}

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------

function HealthScore({ score, riskLevel }: { score: number; riskLevel: 'low' | 'medium' | 'high' }) {
  const scoreColor =
    riskLevel === 'high'
      ? 'text-red-600'
      : riskLevel === 'medium'
        ? 'text-amber-600'
        : 'text-emerald-600';

  const badgeStyle =
    riskLevel === 'high'
      ? 'bg-red-100 text-red-700'
      : riskLevel === 'medium'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-emerald-100 text-emerald-700';

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4">
      <div className={`text-7xl font-bold tabular-nums ${scoreColor}`}>{score}</div>
      <div className="text-sm text-slate-500">overall health score</div>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeStyle}`}>
        {riskLevel} risk
      </span>
    </div>
  );
}

function ModuleCard({ name, module }: { name: string; module: ModuleHealth }) {
  return (
    <a href={module.link} className="group block">
      <div className={`rounded-lg border p-5 transition-shadow hover:shadow-md ${statusBg(module.status)}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${statusDot(module.status)}`} />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {name}
              </span>
            </div>
            <p className={`mt-0.5 text-sm font-semibold ${statusColor(module.status)}`}>
              {statusLabel(module.status)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-700 tabular-nums">{module.score}</span>
            <p className="text-xs text-slate-400">/ 100</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-slate-800">{module.headline}</p>
        <ul className="mt-2 space-y-1">
          {module.details.map((d, i) => (
            <li key={i} className="text-xs text-slate-600">
              · {d}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400 group-hover:text-slate-600">View details →</p>
      </div>
    </a>
  );
}

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------

export default async function InsightsPage() {
  const dashboard = await getInsightsDashboard();

  const sortedAlerts = [
    ...dashboard.alerts.filter((a) => a.level === 'critical'),
    ...dashboard.alerts.filter((a) => a.level === 'warning'),
    ...dashboard.alerts.filter((a) => a.level === 'info'),
  ];

  const updatedAt = new Date(dashboard.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const moduleBreakdown = [
    { label: 'Funnel Radar',    module: dashboard.modules.funnel,       weight: 40 },
    { label: 'Capacity OS',     module: dashboard.modules.capacity,     weight: 30 },
    { label: 'Quality Lab',     module: dashboard.modules.quality,      weight: 20 },
    { label: 'Experiment Hub',  module: dashboard.modules.experiments,  weight: 10 },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Executive Insights</h1>
        <p className="mt-2 text-slate-600">
          Cross-module health analysis · Updated at {updatedAt}
        </p>
      </div>

      {/* Overall score + alerts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <HealthScore score={dashboard.overallHealthScore} riskLevel={dashboard.riskLevel} />
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-3">
          {sortedAlerts.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-8">
              <p className="text-sm font-medium text-emerald-700">
                No active alerts — all modules are reporting healthy signals
              </p>
            </div>
          ) : (
            sortedAlerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${alertRowStyle(alert.level)}`}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold">
                  {alertIconLabel(alert.level)}
                </span>
                <span>
                  <strong>{alert.module}:</strong> {alert.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Module health cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Module Health</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ModuleCard name="Capacity OS"    module={dashboard.modules.capacity} />
          <ModuleCard name="Funnel Radar"   module={dashboard.modules.funnel} />
          <ModuleCard name="Quality Lab"    module={dashboard.modules.quality} />
          <ModuleCard name="Experiment Hub" module={dashboard.modules.experiments} />
        </div>
      </div>

      {/* Insights + Recommendations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>What the data shows this week</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.insights.length === 0 ? (
              <p className="text-sm text-slate-500">
                No insights yet — add data across modules to get started.
              </p>
            ) : (
              <ul className="space-y-3">
                {dashboard.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700">{insight}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggested actions to improve team performance</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.recommendations.length === 0 ? (
              <p className="text-sm text-slate-500">No recommendations at this time.</p>
            ) : (
              <ul className="space-y-3">
                {dashboard.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                      →
                    </span>
                    <p className="text-sm text-slate-700">{rec}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score breakdown bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>
            Weighted average: Funnel 40% · Capacity 30% · Quality 20% · Experiments 10%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moduleBreakdown.map(({ label, module, weight }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-32 shrink-0 text-sm font-medium text-slate-700">{label}</div>
                <div className="flex-1">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${barColor(module.status)}`}
                      style={{ width: `${module.score}%` }}
                    />
                  </div>
                </div>
                <div className="w-10 text-right text-sm font-semibold tabular-nums text-slate-700">
                  {module.score}
                </div>
                <div className="w-16 text-right text-xs text-slate-400">{weight}% weight</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
