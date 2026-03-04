import { NextRequest, NextResponse } from 'next/server';
import { sourcerRoleAssignmentsRepository } from '@/lib/db/repositories/adminRoles';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = await sourcerRoleAssignmentsRepository.deleteById(params.id);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
