export type UserRole = 'lead' | 'sourcer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managerId: string | null;
  weeklyCapacityHours: number;
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
}

export interface UserWithCapacity extends User {
  currentLoadHours: number;
  loadRatio: number;
  availableHours: number;
}
