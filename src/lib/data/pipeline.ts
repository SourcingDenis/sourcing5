import { pipelineStagesRepository } from '@/lib/db/repositories/pipelineStages';
import { interviewsRepository } from '@/lib/db/repositories/interviews';
import { reqsRepository } from '@/lib/db/repositories/reqs';
import type {
  PipelineStage,
  StagePassthrough,
  PipelineView,
  InterviewSummary,
} from '@/lib/types';

// -------------------------------------------------------
// Pure computation helpers
// -------------------------------------------------------

/**
 * Compute stage-to-stage passthrough rates using a cumulative bottom-up method.
 *
 * Because candidateCount represents candidates *currently at* each stage,
 * we compute a running sum from the last stage upward to estimate how many
 * candidates ever reached each stage or beyond.
 *
 * Example:
 *   stages (ordered):  [Applied:45, Phone:20, Technical:12, Onsite:5, Offer:2]
 *   cumulativeAtOrBeyond: [84, 39, 19, 7, 2]
 *   passthrough Applied->Phone: 39/84 = 46%
 */
export function computePassthroughRates(stages: PipelineStage[]): StagePassthrough[] {
  if (stages.length < 2) return [];

  // Build cumulative counts from the bottom up
  const cumulative: number[] = new Array(stages.length).fill(0);
  cumulative[stages.length - 1] = stages[stages.length - 1].candidateCount;
  for (let i = stages.length - 2; i >= 0; i--) {
    cumulative[i] = cumulative[i + 1] + stages[i].candidateCount;
  }

  const rates: StagePassthrough[] = [];
  for (let i = 0; i < stages.length - 1; i++) {
    const fromCount = cumulative[i];
    const toCount = cumulative[i + 1];
    rates.push({
      fromStage: stages[i].stageName,
      toStage: stages[i + 1].stageName,
      fromCount,
      toCount,
      passthroughRate: fromCount > 0 ? toCount / fromCount : 0,
    });
  }

  return rates;
}

// -------------------------------------------------------
// Data access functions (called from Server Components)
// -------------------------------------------------------

export async function getPipelineView(reqId: string, reqTitle: string): Promise<PipelineView> {
  const stages = await pipelineStagesRepository.listByReq(reqId);
  const passthroughRates = computePassthroughRates(stages);

  const totalCandidates = stages.length > 0
    ? stages.reduce((sum, s) => sum + s.candidateCount, 0)
    : 0;

  const firstStageCount = stages.length > 0 ? stages[0].candidateCount : 0;
  const lastStageCount = stages.length > 0 ? stages[stages.length - 1].candidateCount : 0;
  const overallConversion = firstStageCount > 0 ? lastStageCount / firstStageCount : 0;

  return {
    reqId,
    reqTitle,
    stages,
    passthroughRates,
    totalCandidates,
    overallConversion,
  };
}

export async function getAllPipelineViews(): Promise<PipelineView[]> {
  const [reqs, stagesMap] = await Promise.all([
    reqsRepository.listOpenReqs(),
    pipelineStagesRepository.listAllGroupedByReq(),
  ]);

  const views: PipelineView[] = [];
  for (const req of reqs) {
    const stages = stagesMap.get(req.id) ?? [];
    if (stages.length === 0) continue; // skip reqs not yet synced

    const passthroughRates = computePassthroughRates(stages);
    const totalCandidates = stages.reduce((sum, s) => sum + s.candidateCount, 0);
    const firstCount = stages[0].candidateCount;
    const lastCount = stages[stages.length - 1].candidateCount;

    views.push({
      reqId: req.id,
      reqTitle: req.title,
      stages,
      passthroughRates,
      totalCandidates,
      overallConversion: firstCount > 0 ? lastCount / firstCount : 0,
    });
  }

  return views.sort((a, b) => b.totalCandidates - a.totalCandidates);
}

export async function getInterviewSummary(reqId?: string): Promise<InterviewSummary> {
  return interviewsRepository.getSummary(reqId);
}
