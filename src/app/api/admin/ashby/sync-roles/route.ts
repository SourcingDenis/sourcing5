import { NextResponse } from 'next/server';
import { settingsRepository } from '@/lib/db/repositories/settings';
import { ashbyRolesRepository } from '@/lib/db/repositories/adminRoles';
import type { AshbyRole } from '@/lib/types';

interface AshbyDepartment {
  id: string;
  name: string;
  parentId?: string | null;
  isArchived?: boolean;
}

interface AshbyDepartmentListResponse {
  success: boolean;
  results: AshbyDepartment[];
  moreDataAvailable: boolean;
  nextCursor?: string;
}

async function fetchAshbyDepartments(apiKey: string, baseUrl: string): Promise<AshbyDepartment[]> {
  const credentials = Buffer.from(`${apiKey}:`).toString('base64');
  const all: AshbyDepartment[] = [];
  let cursor: string | undefined;

  do {
    const res = await fetch(`${baseUrl}/department.list`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cursor ? { cursor } : {}),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Ashby API error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as AshbyDepartmentListResponse;
    if (!json.success) {
      throw new Error('Ashby API returned failure');
    }

    all.push(...(json.results ?? []));
    cursor = json.moreDataAvailable ? json.nextCursor : undefined;
  } while (cursor);

  return all;
}

export async function POST() {
  const [apiKeySetting, baseUrlSetting] = await Promise.all([
    settingsRepository.getByKey('ashby_api_key'),
    settingsRepository.getByKey('ashby_base_url'),
  ]);

  if (!apiKeySetting?.value?.trim()) {
    return NextResponse.json(
      { error: 'Ashby API key is not configured. Please add it in Settings.' },
      { status: 503 }
    );
  }

  const apiKey = apiKeySetting.value.trim();
  const baseUrl = baseUrlSetting?.value || 'https://api.ashbyhq.com';

  let departments: AshbyDepartment[];
  try {
    departments = await fetchAshbyDepartments(apiKey, baseUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to fetch from Ashby: ${message}` }, { status: 502 });
  }

  const roles: Omit<AshbyRole, 'createdAt'>[] = departments
    .filter((d) => !d.isArchived)
    .map((d) => ({
      id: d.id,
      name: d.name,
      type: 'department',
      parentId: d.parentId || null,
      ashbyData: d as unknown as Record<string, unknown>,
      syncedAt: new Date().toISOString(),
    }));

  const count = await ashbyRolesRepository.upsertMany(roles);

  return NextResponse.json({
    data: { synced: count, total: roles.length },
  });
}
