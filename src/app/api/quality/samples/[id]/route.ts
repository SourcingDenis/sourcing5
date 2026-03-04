import { NextRequest, NextResponse } from 'next/server';
import { outreachSamplesRepository } from '@/lib/db/repositories/outreachSamples';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sample = await outreachSamplesRepository.getById(params.id);
  if (!sample) {
    return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
  }
  return NextResponse.json({ data: sample });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ok = await outreachSamplesRepository.delete(params.id);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to delete sample' }, { status: 500 });
  }
  return NextResponse.json({ data: { deleted: true } });
}
