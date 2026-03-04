import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { outreachSamplesRepository } from '@/lib/db/repositories/outreachSamples';
import { getWeekStartDate } from '@/lib/utils/helpers';

const CreateSampleSchema = z.object({
  userId: z.string().uuid('userId must be a UUID'),
  reqId: z.string().min(1, 'reqId is required'),
  messageText: z.string().min(10, 'message must be at least 10 characters'),
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(request: NextRequest) {
  const week = request.nextUrl.searchParams.get('week');
  const weekStr = week ?? getWeekStartDate().toISOString().split('T')[0];

  const samples = await outreachSamplesRepository.listByWeek(weekStr);
  return NextResponse.json({ data: samples });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateSampleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const input = {
    ...parsed.data,
    weekStartDate: parsed.data.weekStartDate ?? getWeekStartDate().toISOString().split('T')[0],
  };

  const sample = await outreachSamplesRepository.create(input);
  if (!sample) {
    return NextResponse.json({ error: 'Failed to create sample' }, { status: 500 });
  }

  return NextResponse.json({ data: sample }, { status: 201 });
}
