import { NextRequest, NextResponse } from 'next/server';
import { oneOnOnesRepository } from '@/lib/db/repositories/oneOnOnes';
import { UpdateOneOnOneSchema } from '@/lib/utils/validation';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const one = await oneOnOnesRepository.getById(params.id);
  if (!one) {
    return NextResponse.json({ error: '1:1 not found' }, { status: 404 });
  }
  return NextResponse.json({ data: one });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body   = await request.json();
  const parsed = UpdateOneOnOneSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const one = await oneOnOnesRepository.update(params.id, parsed.data);
  if (!one) {
    return NextResponse.json(
      { error: '1:1 not found or update failed' },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: one });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ok = await oneOnOnesRepository.delete(params.id);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
