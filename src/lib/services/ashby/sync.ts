import {
  listAllJobPostings,
  listAllApplicationsForJob,
  listInterviewStagesForJob,
  listAllInterviewSchedules,
  listAllCandidates,
} from './client';
import { supabase } from '@/lib/db/client';
import { funnelMetricsRepository } from '@/lib/db/repositories/funnelMetrics';
import { pipelineStagesRepository } from '@/lib/db/repositories/pipelineStages';
import { interviewsRepository } from '@/lib/db/repositories/interviews';
import { getWeekStartDate } from '@/lib/utils/helpers';
import type { AshbyJobPosting, AshbySyncResult } from './types';
import type { CandidateSourceCount } from '@/lib/types';

const SCREEN_STAGE_KEYWORDS = ['screen', 'phone', 'interview', 'recruiter'];

function isScreenStage(stageName: string): boolean {
  const lower = stageName.toLowerCase();
  return SCREEN_STAGE_KEYWORDS.some((kw) => lower.includes(kw));
}

function mapAshbyStatusToPriority(
  status: AshbyJobPosting['status']
): 'low' | 'medium' | 'high' | 'critical' {
  switch (status) {
    case 'Open':
      return 'medium';
    case 'Closed':
    case 'Archived':
      return 'low';
    default:
      return 'low';
  }
}

function buildReqId(ashbyJobId: string): string {
  return `ASHBY-${ashbyJobId.slice(0, 8).toUpperCase()}`;
}

export async function syncJobPostings(weekStartDate?: string): Promise<AshbySyncResult> {
  const result: AshbySyncResult = { synced: 0, created: 0, updated: 0, errors: [] };
  const targetWeek =
    weekStartDate ?? getWeekStartDate().toISOString().split('T')[0];

  let postings: AshbyJobPosting[];
  try {
    postings = await listAllJobPostings();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error fetching job postings';
    result.errors.push(msg);
    return result;
  }

  for (const posting of postings) {
    const reqId = buildReqId(posting.id);

    // Upsert req
    const { error: reqError } = await supabase.from('reqs').upsert(
      {
        id: reqId,
        title: posting.title,
        function: posting.departmentName ?? 'Unknown',
        level: 'Unknown',
        location: posting.locationName ?? 'Remote',
        priority: mapAshbyStatusToPriority(posting.status),
        ashby_job_id: posting.id,
        ashby_status: posting.status,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (reqError) {
      result.errors.push(`Failed to upsert req ${reqId}: ${reqError.message}`);
      continue;
    }

    result.synced++;

    // Fetch applications and count those in a screen stage for this week
    try {
      const applications = await listAllApplicationsForJob(posting.id);

      const weekStart = new Date(targetWeek);
      const weekEnd = new Date(targetWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const screensCount = applications.filter((app) => {
        const createdAt = new Date(app.createdAt);
        const inWeek = createdAt >= weekStart && createdAt <= weekEnd;
        const inScreen =
          app.currentInterviewStageName != null &&
          isScreenStage(app.currentInterviewStageName);
        return inWeek && inScreen;
      }).length;

      // Update screens_booked on all existing funnel_metrics rows for this req + week
      await funnelMetricsRepository.updateScreensBookedForReq(reqId, targetWeek, screensCount);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Screens sync for ${reqId}: ${msg}`);
    }
  }

  return result;
}

export interface PipelineSyncResult extends AshbySyncResult {
  interviewsSynced: number;
  candidateSourceCounts: CandidateSourceCount[];
}

export async function syncPipelineAndInterviews(): Promise<PipelineSyncResult> {
  const result: PipelineSyncResult = {
    synced: 0,
    created: 0,
    updated: 0,
    errors: [],
    interviewsSynced: 0,
    candidateSourceCounts: [],
  };

  let postings: AshbyJobPosting[];
  try {
    postings = await listAllJobPostings();
  } catch (err) {
    result.errors.push(err instanceof Error ? err.message : 'Failed to fetch job postings');
    return result;
  }

  // Build a map of applicationId -> reqId for interview schedule linking
  const applicationToReq = new Map<string, string>();
  // Build a map of stageId -> stageName for interview schedule linking
  const stageIdToName = new Map<string, string>();

  for (const posting of postings) {
    const reqId = buildReqId(posting.id);

    try {
      // Fetch applications for this posting
      const applications = await listAllApplicationsForJob(posting.id);

      for (const app of applications) {
        applicationToReq.set(app.id, reqId);
      }

      // Fetch interview stages (pipeline definition for the underlying job)
      const stagesRes = await listInterviewStagesForJob(posting.jobId);
      const stages = stagesRes.results ?? [];

      // Count candidates per stage (by currentInterviewStageId)
      const stageCounts = new Map<string, number>();
      for (const app of applications) {
        if (app.currentInterviewStageId) {
          stageCounts.set(
            app.currentInterviewStageId,
            (stageCounts.get(app.currentInterviewStageId) ?? 0) + 1
          );
        }
      }

      // Upsert pipeline_stages rows
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        stageIdToName.set(stage.id, stage.title);
        await pipelineStagesRepository.upsert({
          reqId,
          ashbyStageId: stage.id,
          stageName: stage.title,
          orderIndex: stage.orderIndex ?? i,
          candidateCount: stageCounts.get(stage.id) ?? 0,
        });
      }

      // Clean up stages no longer in Ashby
      if (stages.length > 0) {
        await pipelineStagesRepository.deleteStaleStages(
          reqId,
          stages.map((s) => s.id)
        );
      }

      result.synced++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Pipeline sync for ${reqId}: ${msg}`);
    }
  }

  // Sync interview schedules
  try {
    const schedules = await listAllInterviewSchedules();

    for (const schedule of schedules) {
      const reqId = applicationToReq.get(schedule.applicationId);
      if (!reqId) continue; // skip schedules not linked to known reqs

      const stageName = stageIdToName.get(schedule.interviewStageId) ?? 'Unknown Stage';

      await interviewsRepository.upsert({
        reqId,
        ashbyScheduleId: schedule.id,
        applicationId: schedule.applicationId,
        stageName,
        status: mapAshbyInterviewStatus(schedule.status),
        scheduledAt: schedule.startTime,
        completedAt:
          schedule.status === 'Completed' ? schedule.endTime : null,
      });

      result.interviewsSynced++;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`Interview schedule sync: ${msg}`);
  }

  // Sync candidate source breakdown
  try {
    const candidates = await listAllCandidates();
    const sourceCounts = new Map<string, number>();

    for (const candidate of candidates) {
      const sourceTitle = candidate.source?.title ?? 'Unknown';
      sourceCounts.set(sourceTitle, (sourceCounts.get(sourceTitle) ?? 0) + 1);
    }

    result.candidateSourceCounts = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`Candidate source sync: ${msg}`);
  }

  return result;
}

function mapAshbyInterviewStatus(
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow'
): 'scheduled' | 'completed' | 'cancelled' | 'no_show' {
  switch (status) {
    case 'Scheduled':
      return 'scheduled';
    case 'Completed':
      return 'completed';
    case 'Cancelled':
      return 'cancelled';
    case 'NoShow':
      return 'no_show';
  }
}

export async function getScreensBookedCount(
  ashbyJobPostingId: string,
  weekStart: string,
  weekEnd: string
): Promise<number> {
  let applications;
  try {
    applications = await listAllApplicationsForJob(ashbyJobPostingId);
  } catch {
    return 0;
  }

  return applications.filter((app) => {
    const createdAt = new Date(app.createdAt);
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    const inWeek = createdAt >= start && createdAt <= end;
    const inScreenStage =
      app.currentInterviewStageName != null &&
      isScreenStage(app.currentInterviewStageName);
    return inWeek && inScreenStage;
  }).length;
}
