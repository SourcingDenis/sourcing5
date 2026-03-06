import { settingsRepository } from '@/lib/db/repositories/settings';
import { decryptValue } from '@/lib/utils/encryption';
import type {
  AshbyJobPosting,
  AshbyApplication,
  AshbyListResponse,
  AshbyInterviewStage,
  AshbyInterviewSchedule,
  AshbyCandidate,
} from './types';

async function getAshbyConfig(): Promise<{ apiKey: string; baseUrl: string }> {
  const [apiKeySetting, baseUrlSetting] = await Promise.all([
    settingsRepository.getByKey('ashby_api_key'),
    settingsRepository.getByKey('ashby_base_url'),
  ]);

  let apiKey = apiKeySetting?.value ?? '';
  const baseUrl = baseUrlSetting?.value || 'https://api.ashbyhq.com';

  // Decrypt API key if it's encrypted (contains ':' separator)
  if (apiKey && apiKey.includes(':')) {
    try {
      apiKey = decryptValue(apiKey);
    } catch {
      throw new Error('Failed to decrypt Ashby API key. The key may be corrupted.');
    }
  }

  if (!apiKey) {
    throw new Error(
      'Ashby API key is not configured. Please add it in Settings → Integrations.'
    );
  }

  return { apiKey, baseUrl };
}

async function ashbyPost<T>(
  endpoint: string,
  body: Record<string, unknown> = {}
): Promise<AshbyListResponse<T>> {
  const { apiKey, baseUrl } = await getAshbyConfig();
  const credentials = Buffer.from(`${apiKey}:`).toString('base64');

  const res = await fetch(`${baseUrl}/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Ashby API HTTP error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.errorInfo?.message ?? 'Ashby API error');
  }

  return json as AshbyListResponse<T>;
}

export async function listJobPostings(cursor?: string): Promise<AshbyListResponse<AshbyJobPosting>> {
  return ashbyPost<AshbyJobPosting>('jobPosting.list', {
    ...(cursor ? { cursor } : {}),
  });
}

export async function listApplicationsForJob(
  jobPostingId: string,
  cursor?: string
): Promise<AshbyListResponse<AshbyApplication>> {
  return ashbyPost<AshbyApplication>('application.list', {
    jobPostingId,
    ...(cursor ? { cursor } : {}),
  });
}

export async function listAllJobPostings(): Promise<AshbyJobPosting[]> {
  const all: AshbyJobPosting[] = [];
  let cursor: string | undefined;

  do {
    const res = await listJobPostings(cursor);
    all.push(...res.results);
    cursor = res.moreDataAvailable ? res.nextCursor : undefined;
  } while (cursor);

  return all;
}

export async function listAllApplicationsForJob(jobPostingId: string): Promise<AshbyApplication[]> {
  const all: AshbyApplication[] = [];
  let cursor: string | undefined;

  do {
    const res = await listApplicationsForJob(jobPostingId, cursor);
    all.push(...res.results);
    cursor = res.moreDataAvailable ? res.nextCursor : undefined;
  } while (cursor);

  return all;
}

export async function listInterviewStagesForJob(
  jobId: string
): Promise<AshbyListResponse<AshbyInterviewStage>> {
  return ashbyPost<AshbyInterviewStage>('interviewStage.list', { jobId });
}

export async function listInterviewSchedules(
  cursor?: string
): Promise<AshbyListResponse<AshbyInterviewSchedule>> {
  return ashbyPost<AshbyInterviewSchedule>('interviewSchedule.list', {
    ...(cursor ? { cursor } : {}),
  });
}

export async function listAllInterviewSchedules(): Promise<AshbyInterviewSchedule[]> {
  const all: AshbyInterviewSchedule[] = [];
  let cursor: string | undefined;

  do {
    const res = await listInterviewSchedules(cursor);
    all.push(...res.results);
    cursor = res.moreDataAvailable ? res.nextCursor : undefined;
  } while (cursor);

  return all;
}

export async function listCandidates(
  cursor?: string
): Promise<AshbyListResponse<AshbyCandidate>> {
  return ashbyPost<AshbyCandidate>('candidate.list', {
    ...(cursor ? { cursor } : {}),
  });
}

export async function listAllCandidates(): Promise<AshbyCandidate[]> {
  const all: AshbyCandidate[] = [];
  let cursor: string | undefined;

  do {
    const res = await listCandidates(cursor);
    all.push(...res.results);
    cursor = res.moreDataAvailable ? res.nextCursor : undefined;
  } while (cursor);

  return all;
}
