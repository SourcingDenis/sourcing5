import { supabase } from '../client';
import type { Team, CreateTeamInput, UpdateTeamInput } from '@/lib/types';

export const teamsRepository = {
  async getTeamById(id: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching team:', error);
      return null;
    }

    return mapDbTeamToTeam(data);
  },

  async listTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error listing teams:', error);
      return [];
    }

    return (data || []).map(mapDbTeamToTeam);
  },

  async listTeamsByLead(leadId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('lead_id', leadId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error listing teams by lead:', error);
      return [];
    }

    return (data || []).map(mapDbTeamToTeam);
  },

  async createTeam(input: CreateTeamInput): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: input.name,
        lead_id: input.leadId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      return null;
    }

    return mapDbTeamToTeam(data);
  },

  async updateTeam(id: string, input: UpdateTeamInput): Promise<Team | null> {
    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.leadId !== undefined) updateData.lead_id = input.leadId;

    const { data, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team:', error);
      return null;
    }

    return mapDbTeamToTeam(data);
  },

  async deleteTeam(id: string): Promise<boolean> {
    const { error } = await supabase.from('teams').delete().eq('id', id);

    if (error) {
      console.error('Error deleting team:', error);
      return false;
    }

    return true;
  },
};

function mapDbTeamToTeam(dbTeam: Record<string, unknown>): Team {
  return {
    id: dbTeam.id as string,
    name: dbTeam.name as string,
    leadId: dbTeam.lead_id as string,
    createdAt: dbTeam.created_at as string,
  };
}
