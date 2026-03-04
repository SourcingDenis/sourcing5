import { NextRequest, NextResponse } from 'next/server';
import { experimentsRepository } from '@/lib/db/repositories/experiments';
import { CreateVariantSchema } from '@/lib/utils/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const variants = await experimentsRepository.listVariantsByExperiment(params.id);
  return NextResponse.json({ data: variants });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = CreateVariantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const variant = await experimentsRepository.createVariant({
    experimentId: params.id,
    name:         parsed.data.name,
    description:  parsed.data.description,
  });

  if (!variant) {
    return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 });
  }

  return NextResponse.json({ data: variant }, { status: 201 });
}
