import { NextRequest, NextResponse } from 'next/server';
import { syncJobPostings, syncPipelineAndInterviews } from '@/lib/services/ashby/sync';
import { settingsRepository } from '@/lib/db/repositories/settings';

export async function POST(request: NextRequest) {
  // Check if API key is configured in the database
  const apiKeySetting = await settingsRepository.getByKey('ashby_api_key');
  if (!apiKeySetting || !apiKeySetting.value.trim()) {
    return NextResponse.json(
      { error: 'Ashby API key is not configured. Please add it in Settings → Integrations.' },
      { status: 503 }
    );
  }

  let weekStartDate: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    if (body.weekStartDate && typeof body.weekStartDate === 'string') {
      weekStartDate = body.weekStartDate;
    }
  } catch {
    // body is optional — proceed without it
  }

  // Run job posting sync first (updates reqs + screens_booked)
  const jobResult = await syncJobPostings(weekStartDate);

  // Then sync pipeline stages, interviews, and candidate sources
  const pipelineResult = await syncPipelineAndInterviews();

  const combinedErrors = [...jobResult.errors, ...pipelineResult.errors];
  const status = combinedErrors.length > 0 && jobResult.synced === 0 ? 500 : 200;

  return NextResponse.json(
    {
      data: {
        jobs: jobResult,
        pipeline: {
          synced: pipelineResult.synced,
          interviewsSynced: pipelineResult.interviewsSynced,
          candidateSourceCounts: pipelineResult.candidateSourceCounts,
          errors: pipelineResult.errors,
        },
        errors: combinedErrors,
      },
    },
    { status }
  );
}
