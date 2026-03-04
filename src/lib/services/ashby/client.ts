import { settingsRepository } from '@/lib/db/repositories/settings';
import type { AshbyJobPosting, AshbyApplication, AshbyListResponse } from './types';

async function getAshbyConfig(): Promise<{ apiKey: string; baseUrl: string }> {
  const [apiKeySetting, baseUrlSetting] = await Promise.all([
    settingsRepository.getByKey('ashby_api_key'),
    settingsRepository.getByKey('ashby_base_url'),
  ]);

  const apiKey = apiKeySetting?.value ?? '';
  const baseUrl = baseUrlSetting?.value || 'https://api.ashbyhq.com';

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
