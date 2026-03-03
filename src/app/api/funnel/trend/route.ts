import { NextRequest, NextResponse } from 'next/server';
import { getFunnelTrend } from '@/lib/data/funnel';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const reqId  = request.nextUrl.searchParams.get('reqId');

  if (!userId || !reqId) {
    return NextResponse.json({ error: 'Missing userId or reqId' }, { status: 400 });
  }

  const trend = await getFunnelTrend(userId, reqId);
  return NextResponse.json({ data: trend });
}
