import { supabase } from '../client';
import type { OutreachSample, CreateOutreachSampleInput } from '@/lib/types';

export const outreachSamplesRepository = {
  async getById(id: string): Promise<OutreachSample | null> {
    const { data, error } = await supabase
      .from('outreach_samples')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('outreachSamples.getById:', error);
      return null;
    }

    return mapRow(data);
  },

  async listByUser(userId: string, limit = 52): Promise<OutreachSample[]> {
    const { data, error } = await supabase
      .from('outreach_samples')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('outreachSamples.listByUser:', error);
      return [];
    }

    return (data ?? []).map(mapRow);
  },

  async listByWeek(weekStartDate: string): Promise<
    (OutreachSample & { userName: string; reqTitle: string })[]
  > {
    const { data, error } = await supabase
      .from('outreach_samples')
      .select(`
        *,
        users!outreach_samples_user_id_fkey (id, name),
        reqs!outreach_samples_req_id_fkey  (id, title)
      `)
      .eq('week_start_date', weekStartDate)
      .order('user_id');

    if (error) {
      console.error('outreachSamples.listByWeek:', error);
      return [];
    }

    return (data ?? []).map((r) => {
      const row = r as Record<string, unknown>;
      return {
        ...mapRow(row),
        userName: (row.users as { name: string } | null)?.name ?? 'Unknown',
        reqTitle: (row.reqs as { title: string } | null)?.title ?? 'Unknown',
      };
    });
  },

  // Returns samples for a sourcer since a given date, with joined user+req
  async listByUserSince(
    userId: string,
    since: string
  ): Promise<(OutreachSample & { userName: string; reqTitle: string })[]> {
    const { data, error } = await supabase
      .from('outreach_samples')
      .select(`
        *,
        users!outreach_samples_user_id_fkey (id, name),
        reqs!outreach_samples_req_id_fkey  (id, title)
      `)
      .eq('user_id', userId)
      .gte('week_start_date', since)
      .order('week_start_date', { ascending: true });

    if (error) {
      console.error('outreachSamples.listByUserSince:', error);
      return [];
    }

    return (data ?? []).map((r) => {
      const row = r as Record<string, unknown>;
      return {
        ...mapRow(row),
        userName: (row.users as { name: string } | null)?.name ?? 'Unknown',
        reqTitle: (row.reqs as { title: string } | null)?.title ?? 'Unknown',
      };
    });
  },

  // Returns all samples since a date with joined user+req (used for correlation)
  async listAllSince(
    since: string
  ): Promise<(OutreachSample & { userName: string; reqTitle: string })[]> {
    const { data, error } = await supabase
      .from('outreach_samples')
      .select(`
        *,
        users!outreach_samples_user_id_fkey (id, name),
        reqs!outreach_samples_req_id_fkey  (id, title)
      `)
      .gte('week_start_date', since)
      .order('week_start_date', { ascending: true });

    if (error) {
      console.error('outreachSamples.listAllSince:', error);
      return [];
    }

    return (data ?? []).map((r) => {
      const row = r as Record<string, unknown>;
      return {
        ...mapRow(row),
        userName: (row.users as { name: string } | null)?.name ?? 'Unknown',
        reqTitle: (row.reqs as { title: string } | null)?.title ?? 'Unknown',
      };
    });
  },

  async create(input: CreateOutreachSampleInput): Promise<OutreachSample | null> {
    const { data, error } = await supabase
      .from('outreach_samples')
      .insert({
        user_id: input.userId,
        req_id: input.reqId,
        message_text: input.messageText,
        week_start_date: input.weekStartDate!,
      })
      .select()
      .single();

    if (error) {
      console.error('outreachSamples.create:', error);
      return null;
    }

    return mapRow(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('outreach_samples').delete().eq('id', id);

    if (error) {
      console.error('outreachSamples.delete:', error);
      return false;
    }

    return true;
  },
};

function mapRow(db: Record<string, unknown>): OutreachSample {
  return {
    id: db.id as string,
    userId: db.user_id as string,
    reqId: db.req_id as string,
    messageText: db.message_text as string,
    weekStartDate: db.week_start_date as string,
    createdAt: db.created_at as string,
  };
}
