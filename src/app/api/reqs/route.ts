import { NextRequest, NextResponse } from 'next/server';
import { reqsRepository } from '@/lib/db/repositories/reqs';
import { CreateReqSchema } from '@/lib/utils/validation';
import { generateReqId } from '@/lib/utils/helpers';

export async function GET() {
  const reqs = await reqsRepository.listOpenReqs();
  return NextResponse.json({ data: reqs });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const withId = { ...body, id: body.id || generateReqId(Date.now()) };
  const parsed = CreateReqSchema.safeParse(withId);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const req = await reqsRepository.createReq(parsed.data);
  if (!req) {
    return NextResponse.json({ error: 'Failed to create req' }, { status: 500 });
  }

  return NextResponse.json({ data: req }, { status: 201 });
}
