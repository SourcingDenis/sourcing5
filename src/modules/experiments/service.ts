import { experimentsRepository } from '@/lib/db/repositories/experiments';
import type { ExperimentVariant, ExperimentResult } from '@/lib/types/experiment';
import type { ExperimentWithStats, VariantWithMetrics, SignificanceFlag } from './types';

// ----------------------------------------------------------------
// Thresholds
// ----------------------------------------------------------------
const SIGNIFICANCE_MIN_SAMPLE = 30;
const SIGNIFICANCE_ABS_DIFF   = 0.05;

// ----------------------------------------------------------------
// Pure calculation helpers
// ----------------------------------------------------------------

export function calcRate(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return numerator / denominator;
}

export function calcLift(variantRate: number | null, controlRate: number | null): number | null {
  if (variantRate === null || controlRate === null || controlRate === 0) return null;
  return ((variantRate - controlRate) / controlRate) * 100;
}

export function calcSignificance(
  variantRate: number | null,
  controlRate: number | null,
  variantSample: number,
  controlSample: number,
): SignificanceFlag {
  if (variantRate === null || controlRate === null) return 'insufficient_data';
  if (variantSample < SIGNIFICANCE_MIN_SAMPLE || controlSample < SIGNIFICANCE_MIN_SAMPLE) {
    return 'insufficient_data';
  }
  const absDiff = Math.abs(variantRate - controlRate);
  return absDiff >= SIGNIFICANCE_ABS_DIFF ? 'meaningful' : 'inconclusive';
}

export function formatRate(rate: number | null): string {
  if (rate === null) return '—';
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatLift(lift: number | null): string {
  if (lift === null) return '—';
  const sign = lift >= 0 ? '+' : '';
  return `${sign}${lift.toFixed(1)}%`;
}

// ----------------------------------------------------------------
// Enrich variants with aggregated results and computed metrics
// ----------------------------------------------------------------

export function buildVariantMetrics(
  variants: ExperimentVariant[],
  results: ExperimentResult[],
): VariantWithMetrics[] {
  // Aggregate results per variant
  const totalsMap = new Map<string, { outreachSent: number; replies: number; positiveReplies: number }>();
  for (const r of results) {
    const existing = totalsMap.get(r.variantId) ?? { outreachSent: 0, replies: 0, positiveReplies: 0 };
    totalsMap.set(r.variantId, {
      outreachSent:    existing.outreachSent    + r.outreachSent,
      replies:         existing.replies         + r.replies,
      positiveReplies: existing.positiveReplies + r.positiveReplies,
    });
  }

  // Control is the first variant (earliest created_at, index 0)
  const controlVariant = variants[0];
  const controlTotals  = controlVariant ? (totalsMap.get(controlVariant.id) ?? null) : null;
  const controlReplyRate    = controlTotals ? calcRate(controlTotals.replies, controlTotals.outreachSent) : null;
  const controlPositiveRate = controlTotals ? calcRate(controlTotals.positiveReplies, controlTotals.outreachSent) : null;
  const controlSample       = controlTotals?.outreachSent ?? 0;

  return variants.map((v, idx) => {
    const totals   = totalsMap.get(v.id) ?? { outreachSent: 0, replies: 0, positiveReplies: 0 };
    const replyRate    = calcRate(totals.replies, totals.outreachSent);
    const positiveRate = calcRate(totals.positiveReplies, totals.outreachSent);
    const isControl    = idx === 0;

    return {
      id:           v.id,
      experimentId: v.experimentId,
      name:         v.name,
      description:  v.description,
      createdAt:    v.createdAt,
      isControl,
      totalOutreachSent:    totals.outreachSent,
      totalReplies:         totals.replies,
      totalPositiveReplies: totals.positiveReplies,
      replyRate,
      positiveRate,
      replyRateLift:    isControl ? null : calcLift(replyRate, controlReplyRate),
      positiveRateLift: isControl ? null : calcLift(positiveRate, controlPositiveRate),
      replyRateSignificance: isControl
        ? 'inconclusive'
        : calcSignificance(replyRate, controlReplyRate, totals.outreachSent, controlSample),
      positiveRateSignificance: isControl
        ? 'inconclusive'
        : calcSignificance(positiveRate, controlPositiveRate, totals.outreachSent, controlSample),
    };
  });
}

// ----------------------------------------------------------------
// Data-fetching functions
// ----------------------------------------------------------------

export async function getExperimentWithStats(id: string): Promise<ExperimentWithStats | null> {
  const experiment = await experimentsRepository.getById(id);
  if (!experiment) return null;

  const variants   = await experimentsRepository.listVariantsByExperiment(id);
  const variantIds = variants.map(v => v.id);
  const allResults = await experimentsRepository.listResultsByVariantIds(variantIds);

  const enrichedVariants = buildVariantMetrics(variants, allResults);

  return {
    ...experiment,
    variants: enrichedVariants,
  };
}

export async function getAllExperimentsWithStats(): Promise<ExperimentWithStats[]> {
  const experiments = await experimentsRepository.listAll();
  const results = await Promise.all(
    experiments.map(e => getExperimentWithStats(e.id))
  );
  return results.filter((e): e is ExperimentWithStats => e !== null);
}

export const experimentsService = {
  getExperimentWithStats,
  getAllExperimentsWithStats,
  buildVariantMetrics,
  calcRate,
  calcLift,
  calcSignificance,
  formatRate,
  formatLift,
};
