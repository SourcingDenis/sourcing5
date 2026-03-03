export type AssignmentStatus = 'active' | 'paused' | 'closed';

export interface Assignment {
  id: string;
  userId: string;
  reqId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHoursPerWeek: number;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentInput {
  userId: string;
  reqId: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedHoursPerWeek: number;
  status?: AssignmentStatus;
}

export interface UpdateAssignmentInput {
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedHoursPerWeek?: number;
  status?: AssignmentStatus;
}
