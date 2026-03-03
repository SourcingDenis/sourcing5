import { NextRequest, NextResponse } from 'next/server';
import { syncJobPostings } from '@/lib/services/ashby/sync';
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

  const result = await syncJobPostings(weekStartDate);

  // 207 = partial success when there are errors but some jobs synced
  const status = result.errors.length > 0 && result.synced === 0 ? 500 : 200;
  return NextResponse.json({ data: result }, { status });
}
