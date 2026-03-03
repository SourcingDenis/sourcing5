import { NextRequest, NextResponse } from 'next/server';
import { assignmentsRepository } from '@/lib/db/repositories/assignments';
import { UpdateAssignmentSchema } from '@/lib/utils/validation';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = UpdateAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const assignment = await assignmentsRepository.updateAssignment(params.id, parsed.data);
  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found or update failed' }, { status: 404 });
  }

  return NextResponse.json({ data: assignment });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ok = await assignmentsRepository.deleteAssignment(params.id);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
