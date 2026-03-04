import { outreachSamplesRepository } from '@/lib/db/repositories/outreachSamples';
import { qualityReviewsRepository } from '@/lib/db/repositories/qualityReviews';
import { funnelMetricsRepository } from '@/lib/db/repositories/funnelMetrics';
import { getWeekStartDate } from '@/lib/utils/helpers';
import type {
  OutreachSampleWithReview,
  QualityTrendPoint,
  QualityCorrelationPoint,
  QualityTrend,
  SourcerQualitySummary,
  QualityHighlights,
  TeamQualitySummary,
} from '@/lib/types';

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function isoWeekLabel(weekStartDate: string): string {
  const d = new Date(weekStartDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function weeksBefore(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return getWeekStartDate(d).toISOString().split('T')[0];
}

// Deterministic shuffle seeded by weekStartDate so the 3-sample pick is
// stable across page reloads within the same week.
function seededSample<T>(arr: T[], weekSeed: string, count: number): T[] {
  let seed = weekSeed.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(seed) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// -------------------------------------------------------
// getWeekSamples — all samples for a week, enriched with review
// -------------------------------------------------------

export async function getWeekSamples(
  weekStartDate?: string
): Promise<OutreachSampleWithReview[]> {
  const weekStr = weekStartDate ?? getWeekStartDate().toISOString().split('T')[0];

  const samples = await outreachSamplesRepository.listByWeek(weekStr);
  if (samples.length === 0) return [];

  const reviews = await qualityReviewsRepository.listBySampleIds(
    samples.map((s) => s.id)
  );

  const reviewBySampleId = new Map(reviews.map((r) => [r.outreachSampleId, r]));

  return samples.map((s) => ({
    ...s,
    review: reviewBySampleId.get(s.id) ?? null,
  }));
}

// -------------------------------------------------------
// getWeeklySamplerForAllSourcers
// For each sourcer with samples this week, pick up to 3 unreviewed samples
// (deterministic random seeded by weekStartDate so selections are stable).
// -------------------------------------------------------

export async function getWeeklySamplerForAllSourcers(
  weekStartDate?: string
): Promise<OutreachSampleWithReview[]> {
  const weekStr = weekStartDate ?? getWeekStartDate().toISOString().split('T')[0];

  const allSamples = await getWeekSamples(weekStr);
  if (allSamples.length === 0) return [];

  // Group by sourcer
  const byUser = new Map<string, OutreachSampleWithReview[]>();
  for (const s of allSamples) {
    const list = byUser.get(s.userId) ?? [];
    list.push(s);
    byUser.set(s.userId, list);
  }

  const result: OutreachSampleWithReview[] = [];
  for (const [, userSamples] of byUser) {
    const unreviewed = userSamples.filter((s) => s.review === null);
    // Pick up to 3 unreviewed; if fewer than 3, take all
    const picked = seededSample(unreviewed, weekStr, 3);
    result.push(...picked);
  }

  return result;
}

// -------------------------------------------------------
// getSourcerQualityTrend — weekly avg score history for one sourcer
// -------------------------------------------------------

export async function getSourcerQualityTrend(
  userId: string,
  weeksBack = 12
): Promise<QualityTrendPoint[]> {
  const since = weeksBefore(weeksBack);
  const samples = await outreachSamplesRepository.listByUserSince(userId, since);
  if (samples.length === 0) return [];

  const reviews = await qualityReviewsRepository.listBySampleIds(
    samples.map((s) => s.id)
  );
  const reviewBySampleId = new Map(reviews.map((r) => [r.outreachSampleId, r]));

  // Group by week
  const byWeek = new Map<string, { total: number; count: number }>();
  for (const s of samples) {
    const r = reviewBySampleId.get(s.id);
    if (!r) continue;
    const bucket = byWeek.get(s.weekStartDate) ?? { total: 0, count: 0 };
    bucket.total += r.overallScore;
    bucket.count += 1;
    byWeek.set(s.weekStartDate, bucket);
  }

  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStartDate, { total, count }]) => ({
      weekLabel: isoWeekLabel(weekStartDate),
      weekStartDate,
      avgScore: Number((total / count).toFixed(2)),
      sampleCount: count,
    }));
}

// -------------------------------------------------------
// getTeamQualityCorrelation
// Each point: (sourcer, week) → avgQualityScore + avgReplyRate
// -------------------------------------------------------

export async function getTeamQualityCorrelation(
  weeksBack = 8
): Promise<QualityCorrelationPoint[]> {
  const since = weeksBefore(weeksBack);

  const allSamples = await outreachSamplesRepository.listAllSince(since);
  if (allSamples.length === 0) return [];

  const reviews = await qualityReviewsRepository.listBySampleIds(
    allSamples.map((s) => s.id)
  );
  const reviewBySampleId = new Map(reviews.map((r) => [r.outreachSampleId, r]));

  // Aggregate quality per (userId, weekStartDate)
  type Bucket = { qualityTotal: number; qualityCount: number; userName: string };
  const qualityMap = new Map<string, Bucket>();

  for (const s of allSamples) {
    const r = reviewBySampleId.get(s.id);
    if (!r) continue;
    const key = `${s.userId}::${s.weekStartDate}`;
    const bucket = qualityMap.get(key) ?? { qualityTotal: 0, qualityCount: 0, userName: s.userName };
    bucket.qualityTotal += r.overallScore;
    bucket.qualityCount += 1;
    qualityMap.set(key, bucket);
  }

  if (qualityMap.size === 0) return [];

  // For each unique (userId, weekStartDate) with quality data, get funnel reply_rate
  const points: QualityCorrelationPoint[] = [];

  for (const [key, qBucket] of qualityMap) {
    const [userId, weekStartDate] = key.split('::');
    const funnelRows = await funnelMetricsRepository.listByUser(userId, 52);
    const weekRows = funnelRows.filter((r) => r.weekStartDate === weekStartDate);

    const totalOutreach = weekRows.reduce((s, r) => s + r.outreachSent, 0);
    const totalReplies  = weekRows.reduce((s, r) => s + r.replies, 0);
    const avgReplyRate  = totalOutreach > 0 ? totalReplies / totalOutreach : 0;

    points.push({
      userId,
      userName: qBucket.userName,
      weekLabel: isoWeekLabel(weekStartDate),
      weekStartDate,
      avgScore: Number((qBucket.qualityTotal / qBucket.qualityCount).toFixed(2)),
      avgReplyRate: Number(avgReplyRate.toFixed(4)),
    });
  }

  return points.sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));
}

// -------------------------------------------------------
// getSourcerQualitySummaries — per-sourcer stats + trends
// -------------------------------------------------------

async function buildSourcerSummary(
  userId: string,
  userName: string,
  weekStr: string,
  weeksBack = 8
): Promise<SourcerQualitySummary> {
  const since = weeksBefore(weeksBack);

  // Samples this week
  const thisWeekSamples = await outreachSamplesRepository.listByUserSince(userId, weekStr);
  const thisWeekOnlySamples = thisWeekSamples.filter((s) => s.weekStartDate === weekStr);

  // All samples for trend
  const allSamples = await outreachSamplesRepository.listByUserSince(userId, since);
  const reviews = await qualityReviewsRepository.listBySampleIds(allSamples.map((s) => s.id));
  const reviewBySampleId = new Map(reviews.map((r) => [r.outreachSampleId, r]));

  // This week stats
  const thisWeekReviewed = thisWeekOnlySamples.filter((s) => reviewBySampleId.has(s.id));
  const thisWeekAvgScore =
    thisWeekReviewed.length > 0
      ? thisWeekReviewed.reduce((sum, s) => sum + reviewBySampleId.get(s.id)!.overallScore, 0) /
        thisWeekReviewed.length
      : null;

  // Trend points
  const byWeek = new Map<string, { total: number; count: number }>();
  for (const s of allSamples) {
    const r = reviewBySampleId.get(s.id);
    if (!r) continue;
    const bucket = byWeek.get(s.weekStartDate) ?? { total: 0, count: 0 };
    bucket.total += r.overallScore;
    bucket.count += 1;
    byWeek.set(s.weekStartDate, bucket);
  }

  const trendPoints: QualityTrendPoint[] = [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStartDate, { total, count }]) => ({
      weekLabel: isoWeekLabel(weekStartDate),
      weekStartDate,
      avgScore: Number((total / count).toFixed(2)),
      sampleCount: count,
    }));

  // Rising / declining: compare last 4 weeks vs prior 4 weeks
  const sorted = trendPoints.slice().sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));
  const last4  = sorted.slice(-4);
  const prior4 = sorted.slice(-8, -4);

  let trend: QualityTrend = 'stable';
  if (last4.length >= 2 && prior4.length >= 2) {
    const lastAvg  = last4.reduce((s, p) => s + p.avgScore, 0) / last4.length;
    const priorAvg = prior4.reduce((s, p) => s + p.avgScore, 0) / prior4.length;
    if (lastAvg > priorAvg + 0.3)      trend = 'rising';
    else if (lastAvg < priorAvg - 0.3) trend = 'declining';
  }

  return {
    userId,
    userName,
    thisWeekAvg: thisWeekAvgScore !== null ? Number(thisWeekAvgScore.toFixed(2)) : null,
    trend,
    reviewedCount: thisWeekReviewed.length,
    pendingCount: thisWeekOnlySamples.length - thisWeekReviewed.length,
    trendPoints,
  };
}

// -------------------------------------------------------
// getTeamQualitySummary — aggregate stats for header cards
// -------------------------------------------------------

export async function getTeamQualitySummary(weekStartDate?: string): Promise<TeamQualitySummary> {
  const weekStr = weekStartDate ?? getWeekStartDate().toISOString().split('T')[0];

  const allWeekSamples = await outreachSamplesRepository.listByWeek(weekStr);
  const reviews = await qualityReviewsRepository.listBySampleIds(
    allWeekSamples.map((s) => s.id)
  );
  const reviewBySampleId = new Map(reviews.map((r) => [r.outreachSampleId, r]));

  const reviewedThisWeek = allWeekSamples.filter((s) => reviewBySampleId.has(s.id));
  const avgTeamScore =
    reviewedThisWeek.length > 0
      ? reviewedThisWeek.reduce((sum, s) => sum + reviewBySampleId.get(s.id)!.overallScore, 0) /
        reviewedThisWeek.length
      : null;

  // Build per-sourcer summaries
  const byUser = new Map<string, string>(); // userId → userName
  for (const s of allWeekSamples) {
    byUser.set(s.userId, s.userName);
  }

  const sourcerSummaries: SourcerQualitySummary[] = await Promise.all(
    [...byUser.entries()].map(([uid, uname]) => buildSourcerSummary(uid, uname, weekStr))
  );

  const risingCount   = sourcerSummaries.filter((s) => s.trend === 'rising').length;
  const decliningCount = sourcerSummaries.filter((s) => s.trend === 'declining').length;

  return {
    weekStartDate: weekStr,
    samplesThisWeek: allWeekSamples.length,
    reviewedThisWeek: reviewedThisWeek.length,
    pendingThisWeek: allWeekSamples.length - reviewedThisWeek.length,
    avgTeamScore: avgTeamScore !== null ? Number(avgTeamScore.toFixed(2)) : null,
    risingCount,
    decliningCount,
    sourcerSummaries,
  };
}

// -------------------------------------------------------
// getSourcerQualityHighlights — rising / declining lists
// -------------------------------------------------------

export async function getSourcerQualityHighlights(): Promise<QualityHighlights> {
  const weekStr = getWeekStartDate().toISOString().split('T')[0];
  const since   = weeksBefore(8);

  // Need all sourcers who have samples in the last 8 weeks
  const allSamples = await outreachSamplesRepository.listAllSince(since);
  const byUser = new Map<string, string>();
  for (const s of allSamples) byUser.set(s.userId, s.userName);

  const summaries: SourcerQualitySummary[] = await Promise.all(
    [...byUser.entries()].map(([uid, uname]) => buildSourcerSummary(uid, uname, weekStr))
  );

  return {
    rising:   summaries.filter((s) => s.trend === 'rising'),
    declining: summaries.filter((s) => s.trend === 'declining'),
  };
}
