import { supabase } from '../client';
import type { AshbyRole, SourcerRoleAssignment } from '@/lib/types';

export const ashbyRolesRepository = {
  async listAll(): Promise<AshbyRole[]> {
    const { data, error } = await supabase
      .from('ashby_roles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error listing ashby roles:', error);
      return [];
    }

    return (data || []).map(mapDbToAshbyRole);
  },

  async upsertMany(roles: Omit<AshbyRole, 'createdAt'>[]): Promise<number> {
    const records = roles.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      parent_id: r.parentId || null,
      ashby_data: r.ashbyData || null,
      synced_at: r.syncedAt,
    }));

    const { data, error } = await supabase
      .from('ashby_roles')
      .upsert(records, { onConflict: 'id' })
      .select('id');

    if (error) {
      console.error('Error upserting ashby roles:', error);
      return 0;
    }

    return data?.length ?? 0;
  },

  async deleteById(id: string): Promise<boolean> {
    const { error } = await supabase.from('ashby_roles').delete().eq('id', id);
    if (error) {
      console.error('Error deleting ashby role:', error);
      return false;
    }
    return true;
  },
};

export const sourcerRoleAssignmentsRepository = {
  async listByUserId(userId: string): Promise<SourcerRoleAssignment[]> {
    const { data, error } = await supabase
      .from('sourcer_role_assignments')
      .select('*')
      .eq('user_id', userId)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error listing role assignments:', error);
      return [];
    }

    return (data || []).map(mapDbToAssignment);
  },

  async listAll(): Promise<SourcerRoleAssignment[]> {
    const { data, error } = await supabase
      .from('sourcer_role_assignments')
      .select('*')
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error listing all role assignments:', error);
      return [];
    }

    return (data || []).map(mapDbToAssignment);
  },

  async create(input: {
    userId: string;
    ashbyRoleId?: string;
    reqId?: string;
    notes?: string;
    assignedBy?: string;
  }): Promise<SourcerRoleAssignment | null> {
    const { data, error } = await supabase
      .from('sourcer_role_assignments')
      .insert({
        user_id: input.userId,
        ashby_role_id: input.ashbyRoleId || null,
        req_id: input.reqId || null,
        notes: input.notes || null,
        assigned_by: input.assignedBy || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating role assignment:', error);
      return null;
    }

    return mapDbToAssignment(data);
  },

  async deleteById(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sourcer_role_assignments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting role assignment:', error);
      return false;
    }

    return true;
  },
};

function mapDbToAshbyRole(db: Record<string, unknown>): AshbyRole {
  return {
    id: db.id as string,
    name: db.name as string,
    type: db.type as string,
    parentId: (db.parent_id as string | null) || null,
    ashbyData: (db.ashby_data as Record<string, unknown> | null) || null,
    syncedAt: db.synced_at as string,
    createdAt: db.created_at as string,
  };
}

function mapDbToAssignment(db: Record<string, unknown>): SourcerRoleAssignment {
  return {
    id: db.id as string,
    userId: db.user_id as string,
    ashbyRoleId: (db.ashby_role_id as string | null) || null,
    reqId: (db.req_id as string | null) || null,
    notes: (db.notes as string | null) || null,
    assignedAt: db.assigned_at as string,
    assignedBy: (db.assigned_by as string | null) || null,
  };
}
