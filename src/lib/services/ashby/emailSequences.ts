import { settingsRepository } from '@/lib/db/repositories/settings';
import { decryptValue } from '@/lib/utils/encryption';
import type {
  AshbyEmailSequence,
  AshbyEmailSequenceStep,
  AshbyEmailSequenceUpdatePayload,
  AshbyListResponse,
} from './types';

async function getAshbyConfig(): Promise<{ apiKey: string; baseUrl: string }> {
  const [apiKeySetting, baseUrlSetting] = await Promise.all([
    settingsRepository.getByKey('ashby_api_key'),
    settingsRepository.getByKey('ashby_base_url'),
  ]);

  let apiKey = apiKeySetting?.value ?? '';
  const baseUrl = baseUrlSetting?.value || 'https://api.ashbyhq.com';

  if (apiKey && apiKey.includes(':')) {
    try {
      apiKey = decryptValue(apiKey);
    } catch {
      throw new Error('Failed to decrypt Ashby API key.');
    }
  }

  if (!apiKey) {
    throw new Error('Ashby API key is not configured. Please add it in Settings → Integrations.');
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

async function ashbyPostSingle<T>(
  endpoint: string,
  body: Record<string, unknown> = {}
): Promise<T> {
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

  return json.results as T;
}

export async function listEmailSequences(
  cursor?: string
): Promise<AshbyListResponse<AshbyEmailSequence>> {
  return ashbyPost<AshbyEmailSequence>('emailSequence.list', {
    ...(cursor ? { cursor } : {}),
  });
}

export async function listAllEmailSequences(): Promise<AshbyEmailSequence[]> {
  const all: AshbyEmailSequence[] = [];
  let cursor: string | undefined;

  do {
    const res = await listEmailSequences(cursor);
    all.push(...res.results);
    cursor = res.moreDataAvailable ? res.nextCursor : undefined;
  } while (cursor);

  return all;
}

export async function getEmailSequence(sequenceId: string): Promise<AshbyEmailSequence> {
  return ashbyPostSingle<AshbyEmailSequence>('emailSequence.get', { sequenceId });
}

export async function listEmailSequenceSteps(
  sequenceId: string
): Promise<AshbyEmailSequenceStep[]> {
  // Steps are nested inside the sequence; fall back to empty if not supported
  const sequence = await getEmailSequence(sequenceId);
  return sequence.steps ?? [];
}

export interface StepUpdateResult {
  stepId: string;
  success: boolean;
  error?: string;
}

/**
 * Attempt to update an email sequence step via Ashby API.
 * Returns success/error per step — Ashby may not expose this endpoint
 * depending on plan/permissions, so errors are non-fatal.
 */
export async function updateEmailSequenceStep(
  payload: AshbyEmailSequenceUpdatePayload
): Promise<StepUpdateResult> {
  try {
    await ashbyPostSingle('emailSequenceStep.update', {
      emailSequenceStepId: payload.stepId,
      ...(payload.subject !== undefined ? { subject: payload.subject } : {}),
      ...(payload.body !== undefined ? { body: payload.body } : {}),
    });
    return { stepId: payload.stepId, success: true };
  } catch (err) {
    return {
      stepId: payload.stepId,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function updateEmailSequenceSteps(
  updates: AshbyEmailSequenceUpdatePayload[]
): Promise<StepUpdateResult[]> {
  return Promise.all(updates.map(updateEmailSequenceStep));
}
