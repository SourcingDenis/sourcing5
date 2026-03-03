import { supabase } from '../client';
import type { Req, CreateReqInput, UpdateReqInput, PriorityLevel } from '@/lib/types';

export const reqsRepository = {
  async getReqById(id: string): Promise<Req | null> {
    const { data, error } = await supabase
      .from('reqs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching req:', error);
      return null;
    }

    return mapDbReqToReq(data);
  },

  async listReqs(filters?: { priority?: PriorityLevel; limit?: number }): Promise<Req[]> {
    let query = supabase
      .from('reqs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing reqs:', error);
      return [];
    }

    return (data || []).map(mapDbReqToReq);
  },

  async listOpenReqs(): Promise<Req[]> {
    const { data, error } = await supabase
      .from('reqs')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error listing open reqs:', error);
      return [];
    }

    return (data || []).map(mapDbReqToReq);
  },

  async createReq(input: CreateReqInput): Promise<Req | null> {
    const { data, error } = await supabase
      .from('reqs')
      .insert({
        id: input.id,
        title: input.title,
        function: input.function,
        level: input.level,
        location: input.location,
        priority: input.priority || 'medium',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating req:', error);
      return null;
    }

    return mapDbReqToReq(data);
  },

  async updateReq(id: string, input: UpdateReqInput): Promise<Req | null> {
    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.function !== undefined) updateData.function = input.function;
    if (input.level !== undefined) updateData.level = input.level;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.priority !== undefined) updateData.priority = input.priority;

    const { data, error } = await supabase
      .from('reqs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating req:', error);
      return null;
    }

    return mapDbReqToReq(data);
  },

  async deleteReq(id: string): Promise<boolean> {
    const { error } = await supabase.from('reqs').delete().eq('id', id);

    if (error) {
      console.error('Error deleting req:', error);
      return false;
    }

    return true;
  },
};

function mapDbReqToReq(dbReq: Record<string, unknown>): Req {
  return {
    id: dbReq.id as string,
    title: dbReq.title as string,
    function: dbReq.function as string,
    level: dbReq.level as string,
    location: dbReq.location as string,
    priority: dbReq.priority as PriorityLevel,
    createdAt: dbReq.created_at as string,
  };
}
