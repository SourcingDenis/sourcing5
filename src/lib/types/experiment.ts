export type ExperimentStatus = 'active' | 'completed';

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  startDate: string;
  endDate: string | null;
  ownerId: string;
  status: ExperimentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperimentInput {
  name: string;
  hypothesis: string;
  startDate: string;
  endDate?: string | null;
  ownerId: string;
}

export interface UpdateExperimentInput {
  status?: ExperimentStatus;
  endDate?: string | null;
}

export interface ExperimentVariant {
  id: string;
  experimentId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface CreateVariantInput {
  experimentId: string;
  name: string;
  description: string;
}

export interface ExperimentResult {
  id: string;
  variantId: string;
  outreachSent: number;
  replies: number;
  positiveReplies: number;
  createdAt: string;
}

export interface CreateResultInput {
  variantId: string;
  outreachSent: number;
  replies: number;
  positiveReplies: number;
}
