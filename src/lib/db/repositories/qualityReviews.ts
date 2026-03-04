import { supabase } from '../client';
import type { QualityReview, CreateQualityReviewInput, UpdateQualityReviewInput } from '@/lib/types';

export const qualityReviewsRepository = {
  async getById(id: string): Promise<QualityReview | null> {
    const { data, error } = await supabase
      .from('quality_reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('qualityReviews.getById:', error);
      return null;
    }

    return mapRow(data);
  },

  async getBySample(outreachSampleId: string): Promise<QualityReview | null> {
    const { data, error } = await supabase
      .from('quality_reviews')
      .select('*')
      .eq('outreach_sample_id', outreachSampleId)
      .maybeSingle();

    if (error) {
      console.error('qualityReviews.getBySample:', error);
      return null;
    }

    return data ? mapRow(data) : null;
  },

  async listByReviewer(reviewerId: string): Promise<QualityReview[]> {
    const { data, error } = await supabase
      .from('quality_reviews')
      .select('*')
      .eq('reviewer_id', reviewerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('qualityReviews.listByReviewer:', error);
      return [];
    }

    return (data ?? []).map(mapRow);
  },

  // Batch fetch reviews for a list of sample IDs
  async listBySampleIds(sampleIds: string[]): Promise<QualityReview[]> {
    if (sampleIds.length === 0) return [];

    const { data, error } = await supabase
      .from('quality_reviews')
      .select('*')
      .in('outreach_sample_id', sampleIds);

    if (error) {
      console.error('qualityReviews.listBySampleIds:', error);
      return [];
    }

    return (data ?? []).map(mapRow);
  },

  async create(input: CreateQualityReviewInput): Promise<QualityReview | null> {
    const { data, error } = await supabase
      .from('quality_reviews')
      .insert({
        outreach_sample_id: input.outreachSampleId,
        reviewer_id: input.reviewerId,
        personalization_score: input.personalizationScore,
        relevance_score: input.relevanceScore,
        clarity_score: input.clarityScore,
        cta_score: input.ctaScore,
      })
      .select()
      .single();

    if (error) {
      console.error('qualityReviews.create:', error);
      return null;
    }

    return mapRow(data);
  },

  async update(id: string, input: UpdateQualityReviewInput): Promise<QualityReview | null> {
    const updateData: Record<string, unknown> = {};
    if (input.personalizationScore !== undefined) updateData.personalization_score = input.personalizationScore;
    if (input.relevanceScore !== undefined) updateData.relevance_score = input.relevanceScore;
    if (input.clarityScore !== undefined) updateData.clarity_score = input.clarityScore;
    if (input.ctaScore !== undefined) updateData.cta_score = input.ctaScore;

    const { data, error } = await supabase
      .from('quality_reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('qualityReviews.update:', error);
      return null;
    }

    return mapRow(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('quality_reviews').delete().eq('id', id);

    if (error) {
      console.error('qualityReviews.delete:', error);
      return false;
    }

    return true;
  },
};

function mapRow(db: Record<string, unknown>): QualityReview {
  return {
    id: db.id as string,
    outreachSampleId: db.outreach_sample_id as string,
    reviewerId: db.reviewer_id as string,
    personalizationScore: db.personalization_score as number,
    relevanceScore: db.relevance_score as number,
    clarityScore: db.clarity_score as number,
    ctaScore: db.cta_score as number,
    overallScore: Number(db.overall_score),
    createdAt: db.created_at as string,
  };
}
