import { NextRequest, NextResponse } from 'next/server';
import { actionItemsRepository } from '@/lib/db/repositories/actionItems';
import { UpdateActionItemSchema } from '@/lib/utils/validation';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const item = await actionItemsRepository.getById(params.id);
  if (!item) {
    return NextResponse.json({ error: 'Action item not found' }, { status: 404 });
  }
  return NextResponse.json({ data: item });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body   = await request.json();
  const parsed = UpdateActionItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const item = await actionItemsRepository.update(params.id, parsed.data);
  if (!item) {
    return NextResponse.json(
      { error: 'Action item not found or update failed' },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: item });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ok = await actionItemsRepository.delete(params.id);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
