import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateContent } from '@/modules/playground/service';

const generateSchema = z.object({
  contentType: z.enum(['subject_line', 'email_body', 'follow_up', 'inmail']),
  tone: z.enum(['formal', 'casual', 'friendly', 'witty', 'direct']),
  length: z.enum(['short', 'medium', 'long']),
  personalization: z.object({
    candidateName: z.string().optional(),
    candidateRole: z.string().optional(),
    candidateCompany: z.string().optional(),
    targetRole: z.string().optional(),
    targetCompany: z.string().optional(),
    customNote: z.string().optional(),
  }),
  prompt: z.string().min(1).max(2000),
  existingContent: z.string().max(5000).optional(),
  refinementInstruction: z.string().max(1000).optional(),
  numberOfVariants: z.number().int().min(1).max(5).default(3),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const variants = await generateContent(parsed.data);
    return NextResponse.json({ success: true, variants });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
