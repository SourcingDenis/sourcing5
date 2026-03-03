import { NextRequest, NextResponse } from 'next/server';
import { getTeamFunnelSummary } from '@/lib/data/funnel';

export async function GET(request: NextRequest) {
  const week = request.nextUrl.searchParams.get('week') ?? undefined;
  const summary = await getTeamFunnelSummary(week);
  return NextResponse.json({ data: summary });
}
