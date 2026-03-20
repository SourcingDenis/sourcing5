export interface AshbyJobPosting {
  id: string;
  title: string;
  status: 'Open' | 'Closed' | 'Draft' | 'Archived';
  jobId: string;
  isListed: boolean;
  createdAt: string;
  updatedAt: string;
  locationName?: string;
  departmentName?: string;
}

export interface AshbyApplication {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  currentInterviewStageName?: string;
  currentInterviewStageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AshbyJob {
  id: string;
  title: string;
  status: 'Open' | 'Closed' | 'Draft' | 'Archived';
  isConfidential: boolean;
  createdAt: string;
  updatedAt: string;
  departmentName?: string;
  teamName?: string;
}

// Email Sequence types
export interface AshbyEmailSequenceStep {
  id: string;
  sequenceId: string;
  stepOrder: number;
  type: 'Email' | 'Task' | 'Call';
  delayDays: number;
  subject?: string;
  body?: string;
  isAutomatic: boolean;
}

export interface AshbyEmailSequence {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  steps?: AshbyEmailSequenceStep[];
  stepCount?: number;
}

export interface AshbyEmailSequenceUpdatePayload {
  stepId: string;
  subject?: string;
  body?: string;
}

export interface AshbyListResponse<T> {
  success: true;
  results: T[];
  moreDataAvailable: boolean;
  nextCursor?: string;
}

export interface AshbyErrorResponse {
  success: false;
  errorInfo: {
    code: string;
    message: string;
    requestId: string;
  };
}

export type AshbyResponse<T> = AshbyListResponse<T> | AshbyErrorResponse;

export interface AshbySyncResult {
  synced: number;
  created: number;
  updated: number;
  errors: string[];
}

// Interview stage (ordered pipeline step for a job)
export interface AshbyInterviewStage {
  id: string;
  title: string;
  orderIndex: number;
  jobId: string;
  type: string;
}

// Interview schedule (a scheduled/completed interview event)
export interface AshbyInterviewSchedule {
  id: string;
  applicationId: string;
  interviewStageId: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';
  startTime: string;
  endTime: string;
  createdAt: string;
}

// Candidate with source attribution
export interface AshbyCandidate {
  id: string;
  name: string;
  primaryEmailAddress?: string;
  source?: {
    id: string;
    title: string;
  };
  createdAt: string;
}
