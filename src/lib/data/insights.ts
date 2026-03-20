import { getAllUsersLoad } from './capacity';
import { getTeamFunnelSummary } from './funnel';
import { getTeamQualitySummary } from './quality';
import { getAllExperimentsWithStats } from '@/modules/experiments/service';
import type { InsightsDashboard, ModuleHealth, InsightAlert, UserLoad } from '@/lib/types';
import type { TeamFunnelSummary } from '@/lib/types/funnel';
import type { TeamQualitySummary } from '@/lib/types/quality';
import type { ExperimentWithStats } from '@/modules/experiments/types';

// ----------------------------------------------------------------
// Per-module health computation helpers
// ----------------------------------------------------------------

function capacityHealth(usersLoad: UserLoad[]): ModuleHealth {
  const total = usersLoad.length;

  if (total === 0) {
    return {
      status: 'no_data',
      score: 0,
      headline: 'No users configured',
      details: ['Add users to start tracking capacity'],
      link: '/capacity',
    };
  }

  const overloaded = usersLoad.filter((u) => u.loadRatio > 1.0).length;
  const atRisk = usersLoad.filter((u) => u.loadRatio > 0.8 && u.loadRatio <= 1.0).length;
  const available = usersLoad.filter((u) => u.loadRatio <= 0.8).length;
  const avgLoad = usersLoad.reduce((sum, u) => sum + u.loadRatio, 0) / total;

  // Penalize overloaded heavily, at-risk moderately
  const score = Math.max(
    0,
    Math.round(100 - (overloaded / total) * 60 - (atRisk / total) * 25)
  );

  const status =
    overloaded > 0 && overloaded / total > 0.3
      ? 'critical'
      : overloaded > 0
        ? 'warning'
        : atRisk > 1
          ? 'warning'
          : 'healthy';

  return {
    status,
    score,
    headline: `${(avgLoad * 100).toFixed(0)}% avg utilization across ${total} sourcers`,
    details: [
      `${overloaded} overloaded (>100% capacity)`,
      `${atRisk} at risk (80–100% capacity)`,
      `${available} available (<80% capacity)`,
    ],
    link: '/capacity',
  };
}

function funnelHealth(summary: TeamFunnelSummary): ModuleHealth {
  if (summary.sourcerSummaries.length === 0) {
    return {
      status: 'no_data',
      score: 0,
      headline: 'No funnel data recorded this week',
      details: ['Log outreach metrics to track funnel health'],
      link: '/funnel',
    };
  }

  const replyPct = summary.avgReplyRate * 100;
  const allAlerts = summary.sourcerSummaries
    .flatMap((s) => s.metrics)
    .flatMap((m) => m.alerts);
  const redCount = allAlerts.filter((a) => a.severity === 'red').length;
  const warningCount = allAlerts.filter((a) => a.severity === 'warning').length;

  // Reply rate target is 20%; scale score linearly up to target
  const replyScore = Math.min(80, (replyPct / 20) * 80);
  const alertPenalty = redCount * 12 + warningCount * 5;
  const score = Math.max(0, Math.round(replyScore - alertPenalty + 20));

  const status =
    replyPct < 10 || redCount > 2
      ? 'critical'
      : replyPct < 20 || redCount > 0
        ? 'warning'
        : 'healthy';

  return {
    status,
    score,
    headline: `${replyPct.toFixed(0)}% team reply rate — ${summary.totalOutreach} messages sent`,
    details: [
      `${summary.sourcerSummaries.length} sourcer(s) reporting this week`,
      `${(summary.avgPositiveRate * 100).toFixed(0)}% positive reply rate`,
      `${(summary.avgScreenRate * 100).toFixed(0)}% screen booking rate`,
      redCount > 0 ? `${redCount} critical alert(s) need attention` : 'No critical funnel alerts',
    ],
    link: '/funnel',
  };
}

function qualityHealth(summary: TeamQualitySummary): ModuleHealth {
  if (summary.samplesThisWeek === 0) {
    return {
      status: 'no_data',
      score: 0,
      headline: 'No outreach samples submitted this week',
      details: ['Submit outreach samples to track message quality'],
      link: '/quality',
    };
  }

  const avgScore = summary.avgTeamScore ?? 0;
  const reviewRate =
    summary.samplesThisWeek > 0 ? summary.reviewedThisWeek / summary.samplesThisWeek : 0;

  // Quality on 1–5 scale normalized to 0–80; review rate adds up to 20
  const qualityNorm = avgScore > 0 ? (avgScore / 5) * 80 : 30;
  const reviewBonus = reviewRate * 20;
  const decliningPenalty = summary.decliningCount * 8;
  const score = Math.max(0, Math.round(qualityNorm + reviewBonus - decliningPenalty));

  const status =
    avgScore > 0 && avgScore < 2.5
      ? 'critical'
      : summary.decliningCount > 1 || (avgScore > 0 && avgScore < 3.5)
        ? 'warning'
        : 'healthy';

  return {
    status,
    score,
    headline:
      avgScore > 0 ? `${avgScore.toFixed(1)}/5 avg quality score` : 'No reviewed samples yet',
    details: [
      `${summary.samplesThisWeek} samples submitted this week`,
      `${summary.reviewedThisWeek} reviewed (${(reviewRate * 100).toFixed(0)}%)`,
      summary.risingCount > 0 ? `${summary.risingCount} sourcer(s) trending upward` : '',
      summary.decliningCount > 0
        ? `${summary.decliningCount} sourcer(s) quality declining`
        : 'No declining quality trends',
    ].filter(Boolean),
    link: '/quality',
  };
}

function experimentsHealth(experiments: ExperimentWithStats[]): ModuleHealth {
  if (experiments.length === 0) {
    return {
      status: 'no_data',
      score: 50,
      headline: 'No experiments created yet',
      details: ['Create an A/B test to start optimizing outreach strategies'],
      link: '/experiments',
    };
  }

  const active = experiments.filter((e) => e.status === 'active');
  const completed = experiments.filter((e) => e.status === 'completed');

  const meaningfulCount = completed.reduce((count, exp) => {
    const hasMeaningful = exp.variants
      .filter((v) => !v.isControl)
      .some(
        (v) =>
          v.replyRateSignificance === 'meaningful' || v.positiveRateSignificance === 'meaningful'
      );
    return count + (hasMeaningful ? 1 : 0);
  }, 0);

  const score = Math.min(100, 40 + active.length * 20 + meaningfulCount * 20);

  return {
    status: 'healthy',
    score,
    headline: `${active.length} active experiment(s), ${completed.length} completed`,
    details: [
      `${experiments.length} total A/B experiments`,
      meaningfulCount > 0
        ? `${meaningfulCount} experiment(s) with meaningful findings`
        : 'No statistically significant results yet — keep collecting data',
    ],
    link: '/experiments',
  };
}

// ----------------------------------------------------------------
// Alert generation
// ----------------------------------------------------------------

function buildAlerts(
  usersLoad: UserLoad[],
  funnelSummary: TeamFunnelSummary,
  qualitySummary: TeamQualitySummary
): InsightAlert[] {
  const alerts: InsightAlert[] = [];

  // Capacity alerts
  const overloaded = usersLoad.filter((u) => u.loadRatio > 1.0);
  for (const u of overloaded) {
    alerts.push({
      level: 'critical',
      module: 'Capacity',
      message: `${u.user.name} is overloaded at ${(u.loadRatio * 100).toFixed(0)}% capacity`,
    });
  }

  // Funnel alerts
  const funnelAlerts = funnelSummary.sourcerSummaries
    .flatMap((s) => s.metrics)
    .flatMap((m) => m.alerts);
  for (const a of funnelAlerts.filter((x) => x.severity === 'red')) {
    alerts.push({ level: 'critical', module: 'Funnel', message: a.message });
  }
  for (const a of funnelAlerts.filter((x) => x.severity === 'warning')) {
    alerts.push({ level: 'warning', module: 'Funnel', message: a.message });
  }

  // Quality alerts
  if (qualitySummary.decliningCount > 0) {
    const declining = qualitySummary.sourcerSummaries.filter((s) => s.trend === 'declining');
    for (const s of declining) {
      alerts.push({
        level: 'warning',
        module: 'Quality',
        message: `${s.userName}'s outreach quality is declining over the last 4 weeks`,
      });
    }
  }
  if (qualitySummary.pendingThisWeek > 3) {
    alerts.push({
      level: 'info',
      module: 'Quality',
      message: `${qualitySummary.pendingThisWeek} outreach samples pending review`,
    });
  }

  return alerts;
}

// ----------------------------------------------------------------
// Insight & recommendation generation
// ----------------------------------------------------------------

function buildInsights(
  usersLoad: UserLoad[],
  funnelSummary: TeamFunnelSummary,
  qualitySummary: TeamQualitySummary,
  experiments: ExperimentWithStats[]
): string[] {
  const insights: string[] = [];
  const total = usersLoad.length;

  if (total > 0) {
    const avgLoad = usersLoad.reduce((s, u) => s + u.loadRatio, 0) / total;
    insights.push(
      `Team is at ${(avgLoad * 100).toFixed(0)}% avg capacity utilization across ${total} sourcers`
    );
  }

  if (funnelSummary.totalOutreach > 0) {
    const replyPct = (funnelSummary.avgReplyRate * 100).toFixed(0);
    const screenPct = (funnelSummary.avgScreenRate * 100).toFixed(0);
    insights.push(
      `This week: ${funnelSummary.totalOutreach} messages sent with ${replyPct}% reply rate and ${screenPct}% screen rate`
    );
  }

  if (qualitySummary.avgTeamScore !== null) {
    insights.push(
      `Outreach quality avg ${qualitySummary.avgTeamScore.toFixed(1)}/5 — ${qualitySummary.risingCount} sourcer(s) improving, ${qualitySummary.decliningCount} declining`
    );
  }

  const activeExps = experiments.filter((e) => e.status === 'active');
  if (activeExps.length > 0) {
    insights.push(
      `${activeExps.length} active experiment(s) running — check Experiment Hub for early signals`
    );
  }

  const rising = qualitySummary.sourcerSummaries.filter((s) => s.trend === 'rising');
  if (rising.length > 0) {
    insights.push(
      `Quality rising for: ${rising.map((s) => s.userName).join(', ')} — consider sharing their approach`
    );
  }

  return insights;
}

function buildRecommendations(
  usersLoad: UserLoad[],
  funnelSummary: TeamFunnelSummary,
  qualitySummary: TeamQualitySummary,
  experiments: ExperimentWithStats[]
): string[] {
  const recs: string[] = [];

  const overloaded = usersLoad.filter((u) => u.loadRatio > 1.0);
  if (overloaded.length > 0) {
    recs.push(
      `Rebalance assignments for ${overloaded.map((u) => u.user.name).join(', ')} — they are over capacity`
    );
  }

  const atRisk = usersLoad.filter((u) => u.loadRatio > 0.8 && u.loadRatio <= 1.0);
  if (atRisk.length > 0 && overloaded.length === 0) {
    recs.push(
      `Monitor ${atRisk.map((u) => u.user.name).join(', ')} — approaching capacity limit`
    );
  }

  if (funnelSummary.avgReplyRate < 0.15 && funnelSummary.totalOutreach > 0) {
    recs.push(
      'Reply rate is below 15% — review messaging personalization or targeting criteria'
    );
  }

  if (qualitySummary.pendingThisWeek > 0) {
    recs.push(
      `Review ${qualitySummary.pendingThisWeek} pending outreach samples to maintain quality feedback loop`
    );
  }

  const declining = qualitySummary.sourcerSummaries.filter((s) => s.trend === 'declining');
  if (declining.length > 0) {
    recs.push(
      `Schedule coaching sessions for ${declining.map((s) => s.userName).join(', ')} — quality trending down`
    );
  }

  if (experiments.filter((e) => e.status === 'active').length === 0) {
    recs.push(
      'No active experiments — consider running an A/B test on subject lines or message length'
    );
  }

  const completedWithResults = experiments
    .filter((e) => e.status === 'completed')
    .filter((e) =>
      e.variants
        .filter((v) => !v.isControl)
        .some(
          (v) =>
            v.replyRateSignificance === 'meaningful' || v.positiveRateSignificance === 'meaningful'
        )
    );
  if (completedWithResults.length > 0) {
    recs.push(
      `Apply winning strategies from ${completedWithResults.length} completed experiment(s) to all sourcers`
    );
  }

  if (recs.length === 0) {
    recs.push('Team is performing well — maintain current cadence and keep monitoring metrics');
  }

  return recs;
}

// ----------------------------------------------------------------
// Main aggregation entry point
// ----------------------------------------------------------------

export async function getInsightsDashboard(): Promise<InsightsDashboard> {
  const [usersLoad, funnelSummary, qualitySummary, experiments] = await Promise.all([
    getAllUsersLoad(),
    getTeamFunnelSummary(),
    getTeamQualitySummary(),
    getAllExperimentsWithStats(),
  ]);

  const capacity = capacityHealth(usersLoad);
  const funnel = funnelHealth(funnelSummary);
  const quality = qualityHealth(qualitySummary);
  const experimentsModule = experimentsHealth(experiments);

  // Weighted overall health: capacity 30%, funnel 40%, quality 20%, experiments 10%
  const overallHealthScore = Math.round(
    capacity.score * 0.3 +
    funnel.score * 0.4 +
    quality.score * 0.2 +
    experimentsModule.score * 0.1
  );

  const riskLevel =
    overallHealthScore < 50
      ? 'high'
      : overallHealthScore < 75
        ? 'medium'
        : 'low';

  return {
    timestamp: new Date().toISOString(),
    overallHealthScore,
    riskLevel,
    modules: {
      capacity,
      funnel,
      quality,
      experiments: experimentsModule,
    },
    insights: buildInsights(usersLoad, funnelSummary, qualitySummary, experiments),
    recommendations: buildRecommendations(usersLoad, funnelSummary, qualitySummary, experiments),
    alerts: buildAlerts(usersLoad, funnelSummary, qualitySummary),
  };
}
