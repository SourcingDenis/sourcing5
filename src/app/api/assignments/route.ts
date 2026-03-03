import { NextRequest, NextResponse } from 'next/server';
import { assignmentsRepository } from '@/lib/db/repositories/assignments';
import { getAllAssignmentsWithDetails } from '@/lib/data/capacity';
import { CreateAssignmentSchema } from '@/lib/utils/validation';

export async function GET() {
  const assignments = await getAllAssignmentsWithDetails();
  return NextResponse.json({ data: assignments });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const assignment = await assignmentsRepository.createAssignment(parsed.data);
  if (!assignment) {
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }

  return NextResponse.json({ data: assignment }, { status: 201 });
}
