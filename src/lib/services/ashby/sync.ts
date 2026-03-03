import { listAllJobPostings, listAllApplicationsForJob } from './client';
import { supabase } from '@/lib/db/client';
import { funnelMetricsRepository } from '@/lib/db/repositories/funnelMetrics';
import { getWeekStartDate } from '@/lib/utils/helpers';
import type { AshbyJobPosting, AshbySyncResult } from './types';

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
