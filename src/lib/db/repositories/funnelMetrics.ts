import { supabase } from '../client';
import type { FunnelMetric, CreateFunnelMetricInput, UpdateFunnelMetricInput } from '@/lib/types';

export const funnelMetricsRepository = {
  async getById(id: string): Promise<FunnelMetric | null> {
    const { data, error } = await supabase
      .from('funnel_metrics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('funnelMetrics.getById:', error);
      return null;
    }

    return mapRow(data);
  },

  async listByUser(userId: string, limit = 52): Promise<FunnelMetric[]> {
    const { data, error } = await supabase
      .from('funnel_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('funnelMetrics.listByUser:', error);
      return [];
    }

    return (data ?? []).map(mapRow);
  },

  async listByWeek(weekStartDate: string): Promise<FunnelMetric[]> {
    const { data, error } = await supabase
      .from('funnel_metrics')
      .select('*')
      .eq('week_start_date', weekStartDate)
      .order('user_id');

    if (error) {
      console.error('funnelMetrics.listByWeek:', error);
      return [];
    }

    return (data ?? []).map(mapRow);
  },

  async listByUserAndReq(
    userId: string,
    reqId: string,
    weeksBack = 12
  ): Promise<FunnelMetric[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - weeksBack * 7);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('funnel_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('req_id', reqId)
      .gte('week_start_date', cutoffStr)
      .order('week_start_date', { ascending: true });

    if (error) {
      console.error('funnelMetrics.listByUserAndReq:', error);
      return [];
    }

    return (data ?? []).map(mapRow);
  },

  // Returns metrics for a week with joined user name and req title
  async listByWeekWithDetails(weekStartDate: string): Promise<
    (FunnelMetric & { userName: string; reqTitle: string })[]
  > {
    const { data, error } = await supabase
      .from('funnel_metrics')
      .select(`
        *,
        users!funnel_metrics_user_id_fkey (id, name),
        reqs!funnel_metrics_req_id_fkey  (id, title)
      `)
      .eq('week_start_date', weekStartDate)
      .order('user_id');

    if (error) {
      console.error('funnelMetrics.listByWeekWithDetails:', error);
      return [];
    }

    return (data ?? []).map((row) => ({
      ...mapRow(row),
      userName: (row.users as unknown as { name: string } | null)?.name ?? 'Unknown',
      reqTitle: (row.reqs as unknown as { title: string } | null)?.title ?? 'Unknown',
    }));
  },

  // Upsert: create or update by (user_id, req_id, week_start_date)
  async upsert(input: CreateFunnelMetricInput): Promise<FunnelMetric | null> {
    const { data, error } = await supabase
      .from('funnel_metrics')
      .upsert(
        {
          user_id: input.userId,
          req_id: input.reqId,
          week_start_date: input.weekStartDate,
          outreach_sent: input.outreachSent,
          replies: input.replies,
          positive_replies: input.positiveReplies,
          screens_booked: input.screensBooked ?? 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,req_id,week_start_date' }
      )
      .select()
      .single();

    if (error) {
      console.error('funnelMetrics.upsert:', error);
      return null;
    }

    return mapRow(data);
  },

  async update(id: string, input: UpdateFunnelMetricInput): Promise<FunnelMetric | null> {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.outreachSent !== undefined) updateData.outreach_sent = input.outreachSent;
    if (input.replies !== undefined) updateData.replies = input.replies;
    if (input.positiveReplies !== undefined) updateData.positive_replies = input.positiveReplies;
    if (input.screensBooked !== undefined) updateData.screens_booked = input.screensBooked;

    const { data, error } = await supabase
      .from('funnel_metrics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('funnelMetrics.update:', error);
      return null;
    }

    return mapRow(data);
  },

  // Used by Ashby sync: set screens_booked for all rows matching req + week
  async updateScreensBookedForReq(
    reqId: string,
    weekStartDate: string,
    screensBooked: number
  ): Promise<boolean> {
    const { error } = await supabase
      .from('funnel_metrics')
      .update({ screens_booked: screensBooked, updated_at: new Date().toISOString() })
      .eq('req_id', reqId)
      .eq('week_start_date', weekStartDate);

    if (error) {
      console.error('funnelMetrics.updateScreensBookedForReq:', error);
      return false;
    }

    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('funnel_metrics').delete().eq('id', id);

    if (error) {
      console.error('funnelMetrics.delete:', error);
      return false;
    }

    return true;
  },
};

function mapRow(db: Record<string, unknown>): FunnelMetric {
  return {
    id: db.id as string,
    userId: db.user_id as string,
    reqId: db.req_id as string,
    weekStartDate: db.week_start_date as string,
    outreachSent: db.outreach_sent as number,
    replies: db.replies as number,
    positiveReplies: db.positive_replies as number,
    screensBooked: db.screens_booked as number,
    createdAt: db.created_at as string,
    updatedAt: db.updated_at as string,
  };
}
