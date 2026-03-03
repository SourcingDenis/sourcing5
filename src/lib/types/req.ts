export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Req {
  id: string;
  title: string;
  function: string;
  level: string;
  location: string;
  priority: PriorityLevel;
  createdAt: string;
}

export interface CreateReqInput {
  id: string;
  title: string;
  function: string;
  level: string;
  location: string;
  priority?: PriorityLevel;
}

export interface UpdateReqInput {
  title?: string;
  function?: string;
  level?: string;
  location?: string;
  priority?: PriorityLevel;
}
