import { assignmentsRepository } from '@/lib/db/repositories/assignments';
import { usersRepository } from '@/lib/db/repositories/users';
import type { CapacityMetrics, TeamCapacityMetrics } from '@/lib/types';

export async function calculateUserLoadRatio(userId: string): Promise<number> {
  const user = await usersRepository.getUserById(userId);
  if (!user) return 0;

  const assignments = await assignmentsRepository.listUserAssignments(userId);
  const activeAssignments = assignments.filter((a) => a.status === 'active');

  const allocatedHours = activeAssignments.reduce((sum, a) => sum + a.estimatedHoursPerWeek, 0);
  const ratio = allocatedHours / user.weeklyCapacityHours;

  return Math.min(ratio, 1);
}

export async function getAvailableCapacity(userId: string): Promise<number> {
  const user = await usersRepository.getUserById(userId);
  if (!user) return 0;

  const assignments = await assignmentsRepository.listUserAssignments(userId);
  const activeAssignments = assignments.filter((a) => a.status === 'active');

  const allocatedHours = activeAssignments.reduce((sum, a) => sum + a.estimatedHoursPerWeek, 0);
  return Math.max(user.weeklyCapacityHours - allocatedHours, 0);
}

export async function getCapacityMetrics(userId: string): Promise<CapacityMetrics | null> {
  const user = await usersRepository.getUserById(userId);
  if (!user) return null;

  const assignments = await assignmentsRepository.listUserAssignments(userId);
  const activeAssignments = assignments.filter((a) => a.status === 'active');

  const allocatedHours = activeAssignments.reduce((sum, a) => sum + a.estimatedHoursPerWeek, 0);
  const loadRatio = allocatedHours / user.weeklyCapacityHours;

  return {
    userId,
    allocatedHours,
    availableHours: Math.max(user.weeklyCapacityHours - allocatedHours, 0),
    loadRatio: Math.min(loadRatio, 1),
  };
}

export async function calculateTeamCapacityUtilization(
  teamId: string,
): Promise<TeamCapacityMetrics | null> {
  const users = await usersRepository.listUsersByTeam(teamId);

  if (users.length === 0) {
    return null;
  }

  let totalCapacity = 0;
  let allocatedHours = 0;

  for (const user of users) {
    totalCapacity += user.weeklyCapacityHours;

    const assignments = await assignmentsRepository.listUserAssignments(user.id);
    const activeAssignments = assignments.filter((a) => a.status === 'active');
    allocatedHours += activeAssignments.reduce((sum, a) => sum + a.estimatedHoursPerWeek, 0);
  }

  const utilizationRatio = totalCapacity > 0 ? allocatedHours / totalCapacity : 0;

  return {
    teamId,
    totalCapacity,
    allocatedHours,
    utilizationRatio: Math.min(utilizationRatio, 1),
  };
}
