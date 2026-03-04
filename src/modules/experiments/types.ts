import type { Experiment } from '@/lib/types/experiment';

export type SignificanceFlag = 'meaningful' | 'inconclusive' | 'insufficient_data';

export interface VariantWithMetrics {
  id: string;
  experimentId: string;
  name: string;
  description: string;
  createdAt: string;
  isControl: boolean;

  totalOutreachSent: number;
  totalReplies: number;
  totalPositiveReplies: number;

  replyRate: number | null;
  positiveRate: number | null;

  replyRateLift: number | null;
  positiveRateLift: number | null;

  replyRateSignificance: SignificanceFlag;
  positiveRateSignificance: SignificanceFlag;
}

export interface ExperimentWithStats extends Experiment {
  ownerName: string;
  variants: VariantWithMetrics[];
}
