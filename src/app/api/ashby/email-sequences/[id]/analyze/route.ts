import { NextResponse } from 'next/server';
import { getEmailSequence } from '@/lib/services/ashby/emailSequences';
import { analyzeEmailSequence } from '@/lib/services/gemini/emailSequenceAnalyzer';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const sequence = await getEmailSequence(params.id);
    const analysis = await analyzeEmailSequence(sequence);
    return NextResponse.json({ success: true, analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
