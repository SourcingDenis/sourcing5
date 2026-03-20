import { NextResponse } from 'next/server';
import { ashbyRolesRepository } from '@/lib/db/repositories/adminRoles';

export async function GET() {
  try {
    const roles = await ashbyRolesRepository.listAll();
    return NextResponse.json({ data: roles });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
