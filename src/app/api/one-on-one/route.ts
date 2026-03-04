import { NextRequest, NextResponse } from 'next/server';
import { oneOnOnesRepository } from '@/lib/db/repositories/oneOnOnes';
import { CreateOneOnOneSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  const managerId = request.nextUrl.searchParams.get('managerId');
  const reportId  = request.nextUrl.searchParams.get('reportId');

  if (managerId) {
    const ones = await oneOnOnesRepository.listByManagerWithParticipants(managerId);
    return NextResponse.json({ data: ones });
  }
  if (reportId) {
    const ones = await oneOnOnesRepository.listByReport(reportId);
    return NextResponse.json({ data: ones });
  }
  return NextResponse.json(
    { error: 'Provide ?managerId= or ?reportId= query parameter' },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  const body   = await request.json();
  const parsed = CreateOneOnOneSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const one = await oneOnOnesRepository.create(parsed.data);
  if (!one) {
    return NextResponse.json({ error: 'Failed to create 1:1' }, { status: 500 });
  }
  return NextResponse.json({ data: one }, { status: 201 });
}
