import { NextRequest, NextResponse } from 'next/server';
import { funnelMetricsRepository } from '@/lib/db/repositories/funnelMetrics';
import { CreateFunnelMetricSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  const week = request.nextUrl.searchParams.get('week');
  if (!week) {
    return NextResponse.json({ error: 'Missing ?week=YYYY-MM-DD' }, { status: 400 });
  }

  const metrics = await funnelMetricsRepository.listByWeek(week);
  return NextResponse.json({ data: metrics });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateFunnelMetricSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const metric = await funnelMetricsRepository.upsert(parsed.data);
  if (!metric) {
    return NextResponse.json({ error: 'Failed to save metric' }, { status: 500 });
  }

  return NextResponse.json({ data: metric }, { status: 201 });
}
