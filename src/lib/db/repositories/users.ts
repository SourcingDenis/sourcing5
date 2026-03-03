import { supabase } from '../client';
import type { User, CreateUserInput, UpdateUserInput } from '@/lib/types';

export const usersRepository = {
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return mapDbUserToUser(data);
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return mapDbUserToUser(data);
  },

  async listUsers(filters?: { role?: string; teamId?: string }): Promise<User[]> {
    let query = supabase.from('users').select('*');

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing users:', error);
      return [];
    }

    return (data || []).map(mapDbUserToUser);
  },

  async listUsersByTeam(teamId: string): Promise<User[]> {
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('lead_id')
      .eq('id', teamId)
      .single();

    if (teamError || !teamData) {
      console.error('Error fetching team:', teamError);
      return [];
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', teamData.lead_id);

    if (error) {
      console.error('Error listing users by team:', error);
      return [];
    }

    return (data || []).map(mapDbUserToUser);
  },

  async createUser(input: CreateUserInput): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: input.name,
        email: input.email,
        role: input.role,
        manager_id: input.managerId || null,
        weekly_capacity_hours: input.weeklyCapacityHours || 40,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return mapDbUserToUser(data);
  },

  async updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.managerId !== undefined) updateData.manager_id = input.managerId;
    if (input.weeklyCapacityHours !== undefined) {
      updateData.weekly_capacity_hours = input.weeklyCapacityHours;
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return mapDbUserToUser(data);
  },

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  },
};

function mapDbUserToUser(dbUser: Record<string, unknown>): User {
  return {
    id: dbUser.id as string,
    name: dbUser.name as string,
    email: dbUser.email as string,
    role: dbUser.role as 'lead' | 'sourcer',
    managerId: (dbUser.manager_id as string | null) || null,
    weeklyCapacityHours: dbUser.weekly_capacity_hours as number,
    createdAt: dbUser.created_at as string,
    updatedAt: dbUser.updated_at as string,
  };
}
