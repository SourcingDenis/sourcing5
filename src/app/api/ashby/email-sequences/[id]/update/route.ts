import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateEmailSequenceSteps } from '@/lib/services/ashby/emailSequences';

const UpdateSchema = z.object({
  updates: z.array(
    z.object({
      stepId: z.string().min(1),
      subject: z.string().optional(),
      body: z.string().optional(),
    })
  ).min(1),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  // params.id is the sequenceId — passed through for future filtering/logging
  const sequenceId = params.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const results = await updateEmailSequenceSteps(parsed.data.updates);
    const anyFailed = results.some((r) => !r.success);

    return NextResponse.json({
      success: true,
      sequenceId,
      results,
      note: anyFailed
        ? 'Some steps could not be updated — Ashby may require a higher plan or specific permissions for sequence write access.'
        : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
