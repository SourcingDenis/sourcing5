import { NextResponse } from 'next/server';
import { settingsRepository } from '@/lib/db/repositories/settings';

export async function GET() {
  const settings = await settingsRepository.listAll();
  // Mask the API key value — return only whether it is configured
  const masked = settings.map((s) => ({
    ...s,
    value: s.key === 'ashby_api_key' && s.value ? '***configured***' : s.value,
  }));
  return NextResponse.json({ data: masked });
}
