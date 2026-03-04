// ----------------------------------------------------------------
// OutreachSample — raw DB row shape
// ----------------------------------------------------------------

export interface OutreachSample {
  id: string;
  userId: string;
  reqId: string;
  messageText: string;
  weekStartDate: string;   // ISO date "YYYY-MM-DD"
  createdAt: string;
}

export interface CreateOutreachSampleInput {
  userId: string;
  reqId: string;
  messageText: string;
  weekStartDate?: string;  // defaults to current ISO week Monday
}

// ----------------------------------------------------------------
// QualityReview — raw DB row shape
// overall_score is a Postgres generated column (stored)
// ----------------------------------------------------------------

export interface QualityReview {
  id: string;
  outreachSampleId: string;
  reviewerId: string;
  personalizationScore: number;  // 1–5
  relevanceScore: number;        // 1–5
  clarityScore: number;          // 1–5
  ctaScore: number;              // 1–5
  overallScore: number;          // computed: avg of 4 dimensions
  createdAt: string;
}

export interface CreateQualityReviewInput {
  outreachSampleId: string;
  reviewerId: string;
  personalizationScore: number;
  relevanceScore: number;
  clarityScore: number;
  ctaScore: number;
}

export interface UpdateQualityReviewInput {
  personalizationScore?: number;
  relevanceScore?: number;
  clarityScore?: number;
  ctaScore?: number;
}

// ----------------------------------------------------------------
// Enriched shapes used by the UI
// ----------------------------------------------------------------

export interface OutreachSampleWithReview extends OutreachSample {
  userName: string;
  reqTitle: string;
  review: QualityReview | null;
}

export interface QualityTrendPoint {
  weekLabel: string;       // "Feb 24"
  weekStartDate: string;   // raw ISO for ordering
  avgScore: number;        // avg overall_score for this sourcer+week
  sampleCount: number;
}

export interface QualityCorrelationPoint {
  userId: string;
  userName: string;
  weekLabel: string;
  weekStartDate: string;
  avgScore: number;        // avg quality score
  avgReplyRate: number;    // reply_rate from funnel_metrics
}

export type QualityTrend = 'rising' | 'declining' | 'stable';

export interface SourcerQualitySummary {
  userId: string;
  userName: string;
  thisWeekAvg: number | null;   // null if no reviews this week
  trend: QualityTrend;
  reviewedCount: number;        // total reviewed samples this week
  pendingCount: number;         // unreviewed samples this week
  trendPoints: QualityTrendPoint[];
}

export interface QualityHighlights {
  rising: SourcerQualitySummary[];
  declining: SourcerQualitySummary[];
}

export interface TeamQualitySummary {
  weekStartDate: string;
  samplesThisWeek: number;
  reviewedThisWeek: number;
  pendingThisWeek: number;
  avgTeamScore: number | null;
  risingCount: number;
  decliningCount: number;
  sourcerSummaries: SourcerQualitySummary[];
}
