import { NextRequest, NextResponse } from 'next/server';
import { sourcerRoleAssignmentsRepository } from '@/lib/db/repositories/adminRoles';
import { AssignRoleSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const assignments = userId
      ? await sourcerRoleAssignmentsRepository.listByUserId(userId)
      : await sourcerRoleAssignmentsRepository.listAll();

    return NextResponse.json({ data: assignments });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/role-assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AssignRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const assignment = await sourcerRoleAssignmentsRepository.create(parsed.data);
    if (!assignment) {
      return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
    }

    return NextResponse.json({ data: assignment }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/role-assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
