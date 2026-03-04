import { NextRequest, NextResponse } from 'next/server';
import { getManagerDashboardStats } from '@/lib/data/oneOnOne';

export async function GET(request: NextRequest) {
  const managerId = request.nextUrl.searchParams.get('managerId');
  if (!managerId) {
    return NextResponse.json(
      { error: 'Provide ?managerId= query parameter' },
      { status: 400 }
    );
  }

  const stats = await getManagerDashboardStats(managerId);
  return NextResponse.json({ data: stats });
}
