import { NextRequest, NextResponse } from 'next/server';
import { settingsRepository } from '@/lib/db/repositories/settings';
import { UpdateSettingSchema } from '@/lib/utils/validation';

export async function GET(
  _: NextRequest,
  { params }: { params: { key: string } }
) {
  const setting = await settingsRepository.getByKey(params.key);
  if (!setting) {
    return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
  }

  // Mask sensitive values
  const masked = {
    ...setting,
    value: params.key === 'ashby_api_key' && setting.value ? '***configured***' : setting.value,
  };

  return NextResponse.json({ data: masked });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const body = await request.json();
  const parsed = UpdateSettingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const setting = await settingsRepository.upsert(params.key, parsed.data);
  if (!setting) {
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
  }

  // Return masked value for API key
  const masked = {
    ...setting,
    value: params.key === 'ashby_api_key' && setting.value ? '***configured***' : setting.value,
  };

  return NextResponse.json({ data: masked });
}
