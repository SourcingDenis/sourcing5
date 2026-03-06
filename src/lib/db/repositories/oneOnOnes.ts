import { supabase } from '../client';
import type { OneOnOne, CreateOneOnOneInput, UpdateOneOnOneInput } from '@/lib/types';

export const oneOnOnesRepository = {
  async getById(id: string): Promise<OneOnOne | null> {
    const { data, error } = await supabase
      .from('one_on_ones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('oneOnOnes.getById:', error);
      return null;
    }
    return mapRow(data);
  },

  async listByManager(managerId: string): Promise<OneOnOne[]> {
    const { data, error } = await supabase
      .from('one_on_ones')
      .select('*')
      .eq('manager_id', managerId)
      .order('scheduled_at', { ascending: false });

    if (error) {
      console.error('oneOnOnes.listByManager:', error);
      return [];
    }
    return (data ?? []).map(mapRow);
  },

  async listByManagerWithParticipants(
    managerId: string
  ): Promise<(OneOnOne & { managerName: string; reportName: string })[]> {
    const { data, error } = await supabase
      .from('one_on_ones')
      .select(`
        *,
        manager:users!one_on_ones_manager_id_fkey (id, name),
        report:users!one_on_ones_report_id_fkey   (id, name)
      `)
      .eq('manager_id', managerId)
      .order('scheduled_at', { ascending: false });

    if (error) {
      console.error('oneOnOnes.listByManagerWithParticipants:', error);
      return [];
    }

    return (data ?? []).map((r) => {
      const row = r as Record<string, unknown>;
      return {
        ...mapRow(row),
        managerName: (row.manager as { name: string } | null)?.name ?? 'Unknown',
        reportName:  (row.report  as { name: string } | null)?.name ?? 'Unknown',
      };
    });
  },

  async listByReport(reportId: string): Promise<OneOnOne[]> {
    const { data, error } = await supabase
      .from('one_on_ones')
      .select('*')
      .eq('report_id', reportId)
      .order('scheduled_at', { ascending: false });

    if (error) {
      console.error('oneOnOnes.listByReport:', error);
      return [];
    }
    return (data ?? []).map(mapRow);
  },

  // For dashboard on-time rate calculation — filter by scheduled_at >= since
  async listByManagerInWindow(managerId: string, since: string): Promise<OneOnOne[]> {
    const { data, error } = await supabase
      .from('one_on_ones')
      .select('*')
      .eq('manager_id', managerId)
      .gte('scheduled_at', since)
      .order('scheduled_at', { ascending: false });

    if (error) {
      console.error('oneOnOnes.listByManagerInWindow:', error);
      return [];
    }
    return (data ?? []).map(mapRow);
  },

  async create(input: CreateOneOnOneInput): Promise<OneOnOne | null> {
    const { data, error } = await supabase
      .from('one_on_ones')
      .insert({
        manager_id:   input.managerId,
        report_id:    input.reportId,
        scheduled_at: input.scheduledAt,
        summary:      input.summary ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('oneOnOnes.create:', error);
      return null;
    }
    return mapRow(data);
  },

  async update(id: string, input: UpdateOneOnOneInput): Promise<OneOnOne | null> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.scheduledAt !== undefined) patch.scheduled_at = input.scheduledAt;
    if (input.completedAt !== undefined) patch.completed_at = input.completedAt;
    if (input.summary     !== undefined) patch.summary      = input.summary;

    const { data, error } = await supabase
      .from('one_on_ones')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('oneOnOnes.update:', error);
      return null;
    }
    return mapRow(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('one_on_ones').delete().eq('id', id);
    if (error) {
      console.error('oneOnOnes.delete:', error);
      return false;
    }
    return true;
  },
};

function mapRow(db: Record<string, unknown>): OneOnOne {
  return {
    id:          db.id           as string,
    managerId:   db.manager_id   as string,
    reportId:    db.report_id    as string,
    scheduledAt: db.scheduled_at as string,
    completedAt: (db.completed_at as string | null) ?? null,
    summary:     (db.summary     as string | null) ?? null,
    createdAt:   db.created_at   as string,
    updatedAt:   db.updated_at   as string,
  };
}
