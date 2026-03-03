import { NextRequest, NextResponse } from 'next/server';
import { getAllUsersLoad } from '@/lib/data/capacity';
import { snapshotsRepository } from '@/lib/db/repositories/snapshots';

export async function GET(request: NextRequest) {
  const weekStart = request.nextUrl.searchParams.get('week');
  if (!weekStart) {
    return NextResponse.json({ error: 'Missing week query param (YYYY-MM-DD)' }, { status: 400 });
  }

  const snapshots = await snapshotsRepository.listSnapshotsByWeek(weekStart);
  return NextResponse.json({ data: snapshots });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const weekStart: string = body.weekStart;

  if (!weekStart) {
    return NextResponse.json({ error: 'Missing weekStart in request body' }, { status: 400 });
  }

  const usersLoad = await getAllUsersLoad();

  const results = await Promise.all(
    usersLoad.map((ul) =>
      snapshotsRepository.upsertSnapshot({
        userId: ul.user.id,
        weekStart,
        totalCapacityHours: ul.user.weeklyCapacityHours,
        allocatedHours: ul.assignedHours,
        loadRatio: ul.loadRatio,
      })
    )
  );

  const saved = results.filter(Boolean).length;
  return NextResponse.json({ data: { savedCount: saved } }, { status: 201 });
}
