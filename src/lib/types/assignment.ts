export type AssignmentStatus = 'active' | 'paused' | 'closed';

export interface Assignment {
  id: string;
  userId: string;
  reqId: string;
  estimatedHoursPerWeek: number;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentInput {
  userId: string;
  reqId: string;
  estimatedHoursPerWeek: number;
  status?: AssignmentStatus;
}

export interface UpdateAssignmentInput {
  estimatedHoursPerWeek?: number;
  status?: AssignmentStatus;
}
