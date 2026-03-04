import { NextRequest, NextResponse } from 'next/server';
import { actionItemsRepository } from '@/lib/db/repositories/actionItems';
import { CreateActionItemSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  const ownerId    = request.nextUrl.searchParams.get('ownerId');
  const oneOnOneId = request.nextUrl.searchParams.get('oneOnOneId');

  if (ownerId) {
    const items = await actionItemsRepository.listByOwner(ownerId);
    return NextResponse.json({ data: items });
  }
  if (oneOnOneId) {
    const items = await actionItemsRepository.listByOneOnOne(oneOnOneId);
    return NextResponse.json({ data: items });
  }
  return NextResponse.json(
    { error: 'Provide ?ownerId= or ?oneOnOneId= query parameter' },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  const body   = await request.json();
  const parsed = CreateActionItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const item = await actionItemsRepository.create(parsed.data);
  if (!item) {
    return NextResponse.json({ error: 'Failed to create action item' }, { status: 500 });
  }
  return NextResponse.json({ data: item }, { status: 201 });
}
