import { NextRequest, NextResponse } from 'next/server';
import { experimentsRepository } from '@/lib/db/repositories/experiments';
import { getAllExperimentsWithStats } from '@/modules/experiments/service';
import { CreateExperimentSchema } from '@/lib/utils/validation';

export async function GET() {
  const experiments = await getAllExperimentsWithStats();
  return NextResponse.json({ data: experiments });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateExperimentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const experiment = await experimentsRepository.create(parsed.data);
  if (!experiment) {
    return NextResponse.json({ error: 'Failed to create experiment' }, { status: 500 });
  }

  return NextResponse.json({ data: experiment }, { status: 201 });
}
