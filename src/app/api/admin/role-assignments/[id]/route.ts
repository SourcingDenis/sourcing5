import { NextRequest, NextResponse } from 'next/server';
import { sourcerRoleAssignmentsRepository } from '@/lib/db/repositories/adminRoles';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ok = await sourcerRoleAssignmentsRepository.deleteById(params.id);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/admin/role-assignments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
