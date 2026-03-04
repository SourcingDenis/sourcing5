import { NextRequest, NextResponse } from 'next/server';
import { usersRepository } from '@/lib/db/repositories/users';
import { UpdateUserSchema } from '@/lib/utils/validation';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await usersRepository.getUserById(params.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ data: user });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = UpdateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const user = await usersRepository.updateUser(params.id, parsed.data);
  if (!user) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }

  return NextResponse.json({ data: user });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = await usersRepository.deleteUser(params.id);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
