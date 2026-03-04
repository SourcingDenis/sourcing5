import { NextRequest, NextResponse } from 'next/server';
import { funnelMetricsRepository } from '@/lib/db/repositories/funnelMetrics';
import { UpdateFunnelMetricSchema } from '@/lib/utils/validation';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = UpdateFunnelMetricSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const metric = await funnelMetricsRepository.update(params.id, parsed.data);
  if (!metric) {
    return NextResponse.json(
      { error: 'Metric not found or update failed' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: metric });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const ok = await funnelMetricsRepository.delete(params.id);
  if (!ok) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }

  return NextResponse.json({ data: { deleted: true } });
}
