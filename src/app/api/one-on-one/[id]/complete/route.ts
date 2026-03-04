import { NextRequest, NextResponse } from 'next/server';
import { oneOnOnesRepository } from '@/lib/db/repositories/oneOnOnes';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const one = await oneOnOnesRepository.update(params.id, {
    completedAt: new Date().toISOString(),
  });

  if (!one) {
    return NextResponse.json({ error: '1:1 not found' }, { status: 404 });
  }
  return NextResponse.json({ data: one });
}
