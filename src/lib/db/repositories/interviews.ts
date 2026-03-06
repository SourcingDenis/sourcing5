import { supabase } from '../client';
import type { Interview, UpsertInterviewInput, InterviewSummary } from '@/lib/types';

export const interviewsRepository = {
  async listByReq(reqId: string): Promise<Interview[]> {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('req_id', reqId)
      .order('scheduled_at', { ascending: false });

    if (error) {
      console.error('interviews.listByReq:', error);
      return [];
    }

    return (data ?? []).map(mapRow);
  },

  async listUpcoming(limit = 20): Promise<Interview[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('interviews.listUpcoming:', error);
      return [];
    }

    return (data ?? []).map(mapRow);
  },

  async listRecent(daysBack = 14): Promise<Interview[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .in('status', ['completed', 'cancelled', 'no_show'])
      .gte('scheduled_at', cutoff.toISOString())
      .order('scheduled_at', { ascending: false });

    if (error) {
      console.error('interviews.listRecent:', error);
      return [];
    }

    return (data ?? []).map(mapRow);
  },

  async upsert(input: UpsertInterviewInput): Promise<Interview | null> {
    const { data, error } = await supabase
      .from('interviews')
      .upsert(
        {
          req_id: input.reqId,
          ashby_schedule_id: input.ashbyScheduleId,
          application_id: input.applicationId,
          stage_name: input.stageName,
          status: input.status,
          scheduled_at: input.scheduledAt,
          completed_at: input.completedAt ?? null,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: 'ashby_schedule_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('interviews.upsert:', error);
      return null;
    }

    return mapRow(data);
  },

  async getSummary(reqId?: string): Promise<InterviewSummary> {
    let query = supabase.from('interviews').select('status, scheduled_at');
    if (reqId) {
      query = query.eq('req_id', reqId);
    }
    const { data, error } = await query;

    if (error) {
      console.error('interviews.getSummary:', error);
      return {
        totalScheduled: 0,
        totalCompleted: 0,
        upcomingCount: 0,
        cancelledCount: 0,
        completionRate: 0,
      };
    }

    const now = new Date();
    const rows = (data ?? []) as { status: string; scheduled_at: string }[];
    const totalScheduled = rows.filter((r) => r.status === 'scheduled').length;
    const totalCompleted = rows.filter((r) => r.status === 'completed').length;
    const cancelledCount = rows.filter(
      (r) => r.status === 'cancelled' || r.status === 'no_show'
    ).length;
    const upcomingCount = rows.filter(
      (r) => r.status === 'scheduled' && new Date(r.scheduled_at) > now
    ).length;

    const resolved = totalCompleted + cancelledCount;
    const completionRate = resolved > 0 ? totalCompleted / resolved : 0;

    return {
      totalScheduled,
      totalCompleted,
      upcomingCount,
      cancelledCount,
      completionRate,
    };
  },
};

function mapRow(db: Record<string, unknown>): Interview {
  return {
    id: db.id as string,
    reqId: db.req_id as string,
    ashbyScheduleId: db.ashby_schedule_id as string,
    applicationId: db.application_id as string,
    stageName: db.stage_name as string,
    status: db.status as Interview['status'],
    scheduledAt: db.scheduled_at as string,
    completedAt: (db.completed_at as string | null) ?? null,
    lastSyncedAt: db.last_synced_at as string,
    createdAt: db.created_at as string,
  };
}
