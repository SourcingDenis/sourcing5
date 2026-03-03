import { supabase } from '../client';
import type { CapacitySnapshot } from '@/lib/types';

export const snapshotsRepository = {
  async listSnapshotsByWeek(weekStart: string): Promise<CapacitySnapshot[]> {
    const { data, error } = await supabase
      .from('capacity_snapshots')
      .select('*')
      .eq('week_start', weekStart)
      .order('load_ratio', { ascending: false });

    if (error) {
      console.error('Error listing snapshots by week:', error);
      return [];
    }
    return (data || []).map(mapDbSnapshotToSnapshot);
  },

  async listSnapshotsByUser(userId: string): Promise<CapacitySnapshot[]> {
    const { data, error } = await supabase
      .from('capacity_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false });

    if (error) {
      console.error('Error listing user snapshots:', error);
      return [];
    }
    return (data || []).map(mapDbSnapshotToSnapshot);
  },

  async upsertSnapshot(input: {
    userId: string;
    weekStart: string;
    totalCapacityHours: number;
    allocatedHours: number;
    loadRatio: number;
  }): Promise<CapacitySnapshot | null> {
    const { data, error } = await supabase
      .from('capacity_snapshots')
      .upsert(
        {
          user_id: input.userId,
          week_start: input.weekStart,
          total_capacity_hours: input.totalCapacityHours,
          allocated_hours: input.allocatedHours,
          load_ratio: input.loadRatio,
        },
        { onConflict: 'user_id,week_start' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting snapshot:', error);
      return null;
    }
    return mapDbSnapshotToSnapshot(data);
  },
};

function mapDbSnapshotToSnapshot(db: Record<string, unknown>): CapacitySnapshot {
  return {
    id: db.id as string,
    userId: db.user_id as string,
    weekStart: db.week_start as string,
    totalCapacityHours: db.total_capacity_hours as number,
    allocatedHours: db.allocated_hours as number,
    loadRatio: Number(db.load_ratio),
    createdAt: db.created_at as string,
  };
}
