import { NextRequest, NextResponse } from 'next/server';
import { experimentsRepository } from '@/lib/db/repositories/experiments';
import { getExperimentWithStats } from '@/modules/experiments/service';
import { UpdateExperimentSchema } from '@/lib/utils/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const experiment = await getExperimentWithStats(params.id);
  if (!experiment) {
    return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
  }
  return NextResponse.json({ data: experiment });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = UpdateExperimentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const updated = await experimentsRepository.update(params.id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: 'Experiment not found or update failed' }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}
