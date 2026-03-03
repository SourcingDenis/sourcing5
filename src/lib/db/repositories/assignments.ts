import { supabase } from '../client';
import type { Assignment, CreateAssignmentInput, UpdateAssignmentInput } from '@/lib/types';

export const assignmentsRepository = {
  async getAssignmentById(id: string): Promise<Assignment | null> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching assignment:', error);
      return null;
    }

    return mapDbAssignmentToAssignment(data);
  },

  async listAssignments(filters?: { userId?: string; reqId?: string; status?: string }): Promise<Assignment[]> {
    let query = supabase.from('assignments').select('*');

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.reqId) {
      query = query.eq('req_id', filters.reqId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing assignments:', error);
      return [];
    }

    return (data || []).map(mapDbAssignmentToAssignment);
  },

  async listUserAssignments(userId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing user assignments:', error);
      return [];
    }

    return (data || []).map(mapDbAssignmentToAssignment);
  },

  async listReqAssignments(reqId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('req_id', reqId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing req assignments:', error);
      return [];
    }

    return (data || []).map(mapDbAssignmentToAssignment);
  },

  async listActiveAssignments(): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('Error listing active assignments:', error);
      return [];
    }

    return (data || []).map(mapDbAssignmentToAssignment);
  },

  async createAssignment(input: CreateAssignmentInput): Promise<Assignment | null> {
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        user_id: input.userId,
        req_id: input.reqId,
        priority: input.priority || 'medium',
        estimated_hours_per_week: input.estimatedHoursPerWeek,
        status: input.status || 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      return null;
    }

    return mapDbAssignmentToAssignment(data);
  },

  async updateAssignment(id: string, input: UpdateAssignmentInput): Promise<Assignment | null> {
    const updateData: Record<string, unknown> = {};

    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.estimatedHoursPerWeek !== undefined) {
      updateData.estimated_hours_per_week = input.estimatedHoursPerWeek;
    }
    if (input.status !== undefined) updateData.status = input.status;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('assignments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating assignment:', error);
      return null;
    }

    return mapDbAssignmentToAssignment(data);
  },

  async deleteAssignment(id: string): Promise<boolean> {
    const { error } = await supabase.from('assignments').delete().eq('id', id);

    if (error) {
      console.error('Error deleting assignment:', error);
      return false;
    }

    return true;
  },
};

function mapDbAssignmentToAssignment(dbAssignment: Record<string, unknown>): Assignment {
  return {
    id: dbAssignment.id as string,
    userId: dbAssignment.user_id as string,
    reqId: dbAssignment.req_id as string,
    priority: (dbAssignment.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
    estimatedHoursPerWeek: dbAssignment.estimated_hours_per_week as number,
    status: dbAssignment.status as 'active' | 'paused' | 'closed',
    createdAt: dbAssignment.created_at as string,
    updatedAt: dbAssignment.updated_at as string,
  };
}
