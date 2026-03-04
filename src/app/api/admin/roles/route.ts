import { NextResponse } from 'next/server';
import { ashbyRolesRepository } from '@/lib/db/repositories/adminRoles';

export async function GET() {
  const roles = await ashbyRolesRepository.listAll();
  return NextResponse.json({ data: roles });
}
