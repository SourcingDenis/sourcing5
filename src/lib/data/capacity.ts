import { supabase } from '@/lib/db/client';
import { usersRepository } from '@/lib/db/repositories/users';
import { snapshotsRepository } from '@/lib/db/repositories/snapshots';
import type { UserLoad } from '@/lib/types';

/**
 * Fetch all users with their current active capacity metrics.
 * Uses 2 queries total (all users + all active assignments) to avoid N+1.
 */
export async function getAllUsersLoad(): Promise<UserLoad[]> {
  const [users, assignmentsResult] = await Promise.all([
    usersRepository.listUsers(),
    supabase
      .from('assignments')
      .select('user_id, req_id, priority, estimated_hours_per_week, status, id, created_at, updated_at')
      .eq('status', 'active'),
  ]);

  type RawAssignment = {
    user_id: string;
    req_id: string;
    priority: string | null;
    estimated_hours_per_week: number | null;
    status: string | null;
    id: string;
    created_at: string | null;
    updated_at: string | null;
  };
  const activeAssignments: RawAssignment[] = assignmentsResult.data ?? [];

  // Group assignments by userId
  const assignmentsByUser = new Map<string, typeof activeAssignments>();
  for (const a of activeAssignments) {
    const list = assignmentsByUser.get(a.user_id) ?? [];
    list.push(a);
    assignmentsByUser.set(a.user_id, list);
  }

  return users.map((user) => {
    const userAssignments = assignmentsByUser.get(user.id) ?? [];
    const assignedHours = userAssignments.reduce((sum, a) => sum + (a.estimated_hours_per_week ?? 0), 0);
    const loadRatio = user.weeklyCapacityHours > 0 ? assignedHours / user.weeklyCapacityHours : 0;

    return {
      user,
      assignedHours,
      loadRatio,
      assignments: userAssignments.map((a) => ({
        id: a.id as string,
        userId: a.user_id as string,
        reqId: a.req_id as string,
        priority: (a.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        estimatedHoursPerWeek: a.estimated_hours_per_week as number,
        status: a.status as 'active' | 'paused' | 'closed',
        createdAt: a.created_at as string,
        updatedAt: a.updated_at as string,
      })),
    };
  });
}

/**
 * Returns capacity data for a given week.
 * Uses persisted snapshots if available, otherwise falls back to live data.
 */
export async function getUsersLoadForWeek(weekStart: string): Promise<UserLoad[]> {
  const snapshots = await snapshotsRepository.listSnapshotsByWeek(weekStart);

  if (snapshots.length > 0) {
    // Return data from snapshots (historical view)
    const users = await usersRepository.listUsers();
    const snapByUserId = new Map(snapshots.map((s) => [s.userId, s]));

    return users.map((user) => {
      const snap = snapByUserId.get(user.id);
      return {
        user: { ...user, weeklyCapacityHours: snap?.totalCapacityHours ?? user.weeklyCapacityHours },
        assignedHours: snap?.allocatedHours ?? 0,
        loadRatio: snap?.loadRatio ?? 0,
        assignments: [],
      };
    });
  }

  // No snapshots for this week — fall back to live data
  return getAllUsersLoad();
}

/**
 * Get all assignments with joined user name and req title.
 */
export async function getAllAssignmentsWithDetails() {
  const { data, error } = await supabase
    .from('assignments')
    .select(
      `
      id,
      user_id,
      req_id,
      priority,
      estimated_hours_per_week,
      status,
      created_at,
      updated_at,
      users!assignments_user_id_fkey (id, name),
      reqs!assignments_req_id_fkey (id, title)
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assignments with details:', error);
    return [];
  }

  type JoinedAssignment = {
    id: string;
    user_id: string;
    req_id: string;
    priority: string | null;
    estimated_hours_per_week: number | null;
    status: string | null;
    created_at: string | null;
    updated_at: string | null;
    users: { id: string; name: string } | null;
    reqs: { id: string; title: string } | null;
  };

  return ((data as JoinedAssignment[]) || []).map((a) => ({
    id: a.id,
    userId: a.user_id,
    reqId: a.req_id,
    priority: (a.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
    estimatedHoursPerWeek: a.estimated_hours_per_week ?? 0,
    status: (a.status as 'active' | 'paused' | 'closed') || 'active',
    createdAt: a.created_at ?? '',
    updatedAt: a.updated_at ?? '',
    userName: a.users?.name ?? 'Unknown',
    reqTitle: a.reqs?.title ?? 'Unknown',
  }));
}
