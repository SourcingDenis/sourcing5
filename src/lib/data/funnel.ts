import { funnelMetricsRepository } from '@/lib/db/repositories/funnelMetrics';
import { getWeekStartDate } from '@/lib/utils/helpers';
import type {
  FunnelMetric,
  FunnelRates,
  FunnelAlert,
  FunnelMetricRow,
  SourcerFunnelSummary,
  TeamFunnelSummary,
  FunnelTrendPoint,
  SourcerFunnelHealth,
  AlertSeverity,
} from '@/lib/types';

// -------------------------------------------------------
// Pure computation helpers
// -------------------------------------------------------

export function computeRates(m: FunnelMetric): FunnelRates {
  const base = m.outreachSent > 0 ? m.outreachSent : 1;
  return {
    replyRate:    m.replies         / base,
    positiveRate: m.positiveReplies / base,
    screenRate:   m.screensBooked   / base,
  };
}

export function computeAlerts(
  current: FunnelMetric,
  prior?: FunnelMetric
): FunnelAlert[] {
  const alerts: FunnelAlert[] = [];
  const { replyRate } = computeRates(current);

  if (current.outreachSent === 0) {
    alerts.push({ severity: 'warning', message: 'No outreach sent this week' });
  } else if (replyRate < 0.15) {
    alerts.push({
      severity: 'red',
      message: `Reply rate ${(replyRate * 100).toFixed(0)}% — below 15% threshold`,
    });
  }

  if (prior && prior.outreachSent > 0 && current.outreachSent > 0) {
    const drop = (prior.outreachSent - current.outreachSent) / prior.outreachSent;
    if (drop > 0.3) {
      alerts.push({
        severity: 'flag',
        message: `Outreach dropped ${(drop * 100).toFixed(0)}% week-over-week`,
      });
    }
  }

  return alerts;
}

export function worstSeverity(alerts: FunnelAlert[]): AlertSeverity {
  if (alerts.some((a) => a.severity === 'red'))     return 'red';
  if (alerts.some((a) => a.severity === 'warning')) return 'warning';
  if (alerts.some((a) => a.severity === 'flag'))    return 'flag';
  return 'ok';
}

// -------------------------------------------------------
// Data access functions (called from Server Components)
// -------------------------------------------------------

export async function getTeamFunnelSummary(weekStartDate?: string): Promise<TeamFunnelSummary> {
  const weekStr = weekStartDate ?? getWeekStartDate().toISOString().split('T')[0];

  const rows = await funnelMetricsRepository.listByWeekWithDetails(weekStr);

  // Group by userId
  const byUser = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = byUser.get(row.userId) ?? [];
    list.push(row);
    byUser.set(row.userId, list);
  }

  // Prior week data for WoW alerts
  const priorDate = new Date(weekStr);
  priorDate.setDate(priorDate.getDate() - 7);
  const priorWeekStr = priorDate.toISOString().split('T')[0];
  const priorRows = await funnelMetricsRepository.listByWeek(priorWeekStr);
  const priorByKey = new Map(priorRows.map((r) => [`${r.userId}:${r.reqId}`, r]));

  const sourcerSummaries: SourcerFunnelSummary[] = [];

  for (const [userId, userRows] of byUser) {
    const enriched: FunnelMetricRow[] = userRows.map((row) => {
      const prior = priorByKey.get(`${row.userId}:${row.reqId}`);
      const alerts = computeAlerts(row, prior);
      return { ...row, ...computeRates(row), alerts };
    });

    const totals = enriched.reduce(
      (acc, r) => ({
        outreach: acc.outreach + r.outreachSent,
        replies:  acc.replies  + r.replies,
        positive: acc.positive + r.positiveReplies,
        screens:  acc.screens  + r.screensBooked,
      }),
      { outreach: 0, replies: 0, positive: 0, screens: 0 }
    );

    const avgReplyRate =
      totals.outreach > 0 ? totals.replies / totals.outreach : 0;
    const allAlerts = enriched.flatMap((r) => r.alerts);

    sourcerSummaries.push({
      userId,
      userName: userRows[0].userName,
      totalOutreach: totals.outreach,
      totalReplies:  totals.replies,
      totalPositive: totals.positive,
      totalScreens:  totals.screens,
      avgReplyRate,
      overallHealth: worstSeverity(allAlerts),
      metrics: enriched,
    });
  }

  const teamOutreach = sourcerSummaries.reduce((s, ss) => s + ss.totalOutreach, 0);
  const teamReplies  = sourcerSummaries.reduce((s, ss) => s + ss.totalReplies,  0);
  const teamPositive = sourcerSummaries.reduce((s, ss) => s + ss.totalPositive, 0);
  const teamScreens  = sourcerSummaries.reduce((s, ss) => s + ss.totalScreens,  0);
  const base         = teamOutreach > 0 ? teamOutreach : 1;

  return {
    weekStartDate: weekStr,
    totalOutreach:   teamOutreach,
    avgReplyRate:    teamReplies  / base,
    avgPositiveRate: teamPositive / base,
    avgScreenRate:   teamScreens  / base,
    sourcerSummaries,
  };
}

export async function getFunnelTrend(
  userId: string,
  reqId: string,
  weeksBack = 12
): Promise<FunnelTrendPoint[]> {
  const rows = await funnelMetricsRepository.listByUserAndReq(userId, reqId, weeksBack);

  return rows.map((r) => {
    const rates = computeRates(r);
    const d = new Date(r.weekStartDate + 'T00:00:00');
    return {
      weekLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weekStartDate: r.weekStartDate,
      replyRate:    rates.replyRate,
      positiveRate: rates.positiveRate,
      screenRate:   rates.screenRate,
    };
  });
}

export async function getSourcerFunnelHealthBadges(
  weekStartDate?: string
): Promise<SourcerFunnelHealth[]> {
  const summary = await getTeamFunnelSummary(weekStartDate);
  return summary.sourcerSummaries.map((s) => ({
    userId:      s.userId,
    health:      s.overallHealth,
    worstAlert:  s.metrics.flatMap((m) => m.alerts)[0] ?? null,
  }));
}
