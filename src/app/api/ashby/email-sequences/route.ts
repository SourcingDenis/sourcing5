import { NextResponse } from 'next/server';
import { listAllEmailSequences } from '@/lib/services/ashby/emailSequences';

export async function GET() {
  try {
    const sequences = await listAllEmailSequences();
    return NextResponse.json({ success: true, sequences });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
