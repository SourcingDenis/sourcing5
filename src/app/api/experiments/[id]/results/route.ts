import { NextRequest, NextResponse } from 'next/server';
import { experimentsRepository } from '@/lib/db/repositories/experiments';
import { CreateResultSchema } from '@/lib/utils/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const variants   = await experimentsRepository.listVariantsByExperiment(params.id);
  const variantIds = variants.map(v => v.id);
  const results    = await experimentsRepository.listResultsByVariantIds(variantIds);
  return NextResponse.json({ data: results });
}

export async function POST(
  request: NextRequest,
  _context: { params: { id: string } }
) {
  const body   = await request.json();
  const parsed = CreateResultSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const result = await experimentsRepository.createResult(parsed.data);
  if (!result) {
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
  }

  return NextResponse.json({ data: result }, { status: 201 });
}
