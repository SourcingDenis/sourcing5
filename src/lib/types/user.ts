export type UserRole = 'lead' | 'sourcer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managerId: string | null;
  weeklyCapacityHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  managerId?: string | null;
  weeklyCapacityHours?: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  managerId?: string | null;
  weeklyCapacityHours?: number;
  isActive?: boolean;
}

export interface UserWithCapacity extends User {
  currentLoadHours: number;
  loadRatio: number;
  availableHours: number;
}

export interface AshbyRole {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  ashbyData: Record<string, unknown> | null;
  syncedAt: string;
  createdAt: string;
}

export interface SourcerRoleAssignment {
  id: string;
  userId: string;
  ashbyRoleId: string | null;
  reqId: string | null;
  notes: string | null;
  assignedAt: string;
  assignedBy: string | null;
}
