import { usersRepository } from '@/lib/db/repositories/users';
import { teamsRepository } from '@/lib/db/repositories/teams';
import { reqsRepository } from '@/lib/db/repositories/reqs';
import { assignmentsRepository } from '@/lib/db/repositories/assignments';
import { calculateUserLoadRatio } from './capacity';
import type { MetricSnapshot } from '@/lib/types';

export async function aggregateMetricsForInsights(): Promise<MetricSnapshot> {
  const timestamp = new Date().toISOString();

  const users = await usersRepository.listUsers();
  const teams = await teamsRepository.listTeams();
  const reqs = await reqsRepository.listOpenReqs();
  const assignments = await assignmentsRepository.listActiveAssignments();

  const totalCapacityHours = users.reduce((sum, u) => sum + u.weeklyCapacityHours, 0);
  const allocatedHours = assignments.reduce((sum, a) => sum + a.estimatedHoursPerWeek, 0);
  const availableHours = totalCapacityHours - allocatedHours;

  const userLoadRatios = await Promise.all(users.map((u) => calculateUserLoadRatio(u.id)));
  const avgLoadRatio = users.length > 0 ? userLoadRatios.reduce((a, b) => a + b, 0) / users.length : 0;

  return {
    timestamp,
    totalCapacityHours,
    allocatedHours,
    availableHours,
    utilizationRatio: totalCapacityHours > 0 ? allocatedHours / totalCapacityHours : 0,
    userCount: users.length,
    teamCount: teams.length,
    openReqs: reqs.length,
    activeAssignments: assignments.length,
    moduleMetrics: {
      capacityAverageLoadRatio: avgLoadRatio,
    },
  };
}
