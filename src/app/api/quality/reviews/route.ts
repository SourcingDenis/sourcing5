import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { qualityReviewsRepository } from '@/lib/db/repositories/qualityReviews';

const ScoreField = z.number().int().min(1).max(5);

const CreateReviewSchema = z.object({
  outreachSampleId: z.string().uuid('outreachSampleId must be a UUID'),
  reviewerId: z.string().uuid('reviewerId must be a UUID'),
  personalizationScore: ScoreField,
  relevanceScore: ScoreField,
  clarityScore: ScoreField,
  ctaScore: ScoreField,
});

export async function GET(request: NextRequest) {
  const sampleId = request.nextUrl.searchParams.get('sampleId');

  if (sampleId) {
    const review = await qualityReviewsRepository.getBySample(sampleId);
    return NextResponse.json({ data: review });
  }

  const reviewerId = request.nextUrl.searchParams.get('reviewerId');
  if (reviewerId) {
    const reviews = await qualityReviewsRepository.listByReviewer(reviewerId);
    return NextResponse.json({ data: reviews });
  }

  return NextResponse.json({ error: 'Provide ?sampleId or ?reviewerId' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateReviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const review = await qualityReviewsRepository.create(parsed.data);
  if (!review) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }

  return NextResponse.json({ data: review }, { status: 201 });
}
