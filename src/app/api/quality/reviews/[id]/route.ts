import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { qualityReviewsRepository } from '@/lib/db/repositories/qualityReviews';

const ScoreField = z.number().int().min(1).max(5);

const UpdateReviewSchema = z.object({
  personalizationScore: ScoreField.optional(),
  relevanceScore: ScoreField.optional(),
  clarityScore: ScoreField.optional(),
  ctaScore: ScoreField.optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = UpdateReviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const review = await qualityReviewsRepository.update(params.id, parsed.data);
  if (!review) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }

  return NextResponse.json({ data: review });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ok = await qualityReviewsRepository.delete(params.id);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
  return NextResponse.json({ data: { deleted: true } });
}
