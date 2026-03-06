// ----------------------------------------------------------------
// Pipeline Stage — DB row shape
// ----------------------------------------------------------------

export interface PipelineStage {
  id: string;
  reqId: string;
  ashbyStageId: string;
  stageName: string;
  orderIndex: number;
  candidateCount: number;
  lastSyncedAt: string;
  createdAt: string;
}

export interface UpsertPipelineStageInput {
  reqId: string;
  ashbyStageId: string;
  stageName: string;
  orderIndex: number;
  candidateCount: number;
}

// ----------------------------------------------------------------
// Interview — DB row shape
// ----------------------------------------------------------------

export interface Interview {
  id: string;
  reqId: string;
  ashbyScheduleId: string;
  applicationId: string;
  stageName: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  scheduledAt: string;
  completedAt: string | null;
  lastSyncedAt: string;
  createdAt: string;
}

export interface UpsertInterviewInput {
  reqId: string;
  ashbyScheduleId: string;
  applicationId: string;
  stageName: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  scheduledAt: string;
  completedAt?: string | null;
}

// ----------------------------------------------------------------
// Computed types (never stored)
// ----------------------------------------------------------------

export interface StagePassthrough {
  fromStage: string;
  toStage: string;
  fromCount: number;
  toCount: number;
  passthroughRate: number; // 0-1
}

export interface PipelineView {
  reqId: string;
  reqTitle: string;
  stages: PipelineStage[];
  passthroughRates: StagePassthrough[];
  totalCandidates: number;
  overallConversion: number; // last-stage / first-stage candidates
}

export interface InterviewSummary {
  totalScheduled: number;
  totalCompleted: number;
  upcomingCount: number;
  cancelledCount: number;
  completionRate: number; // completed / (completed + cancelled + no_show)
}

// ----------------------------------------------------------------
// Candidate Source — for source breakdown
// ----------------------------------------------------------------

export interface CandidateSourceCount {
  source: string;
  count: number;
}
