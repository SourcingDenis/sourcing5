import { NextRequest, NextResponse } from 'next/server';
import { usersRepository } from '@/lib/db/repositories/users';
import { CreateUserSchema } from '@/lib/utils/validation';

export async function GET() {
  const users = await usersRepository.listUsers();
  return NextResponse.json({ data: users });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const user = await usersRepository.createUser(parsed.data);
  if (!user) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }

  return NextResponse.json({ data: user }, { status: 201 });
}
