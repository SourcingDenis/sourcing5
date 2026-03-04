import { NextRequest, NextResponse } from 'next/server';
import { oneOnOnesRepository } from '@/lib/db/repositories/oneOnOnes';
import { generateAgenda } from '@/lib/data/oneOnOne';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const one = await oneOnOnesRepository.getById(params.id);
  if (!one) {
    return NextResponse.json({ error: '1:1 not found' }, { status: 404 });
  }

  const agenda = await generateAgenda(one.managerId, one.reportId);
  return NextResponse.json({ data: agenda });
}
