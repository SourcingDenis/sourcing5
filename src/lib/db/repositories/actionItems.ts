import { supabase } from '../client';
import type { ActionItem, CreateActionItemInput, UpdateActionItemInput } from '@/lib/types';

export const actionItemsRepository = {
  async getById(id: string): Promise<ActionItem | null> {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('actionItems.getById:', error);
      return null;
    }
    return mapRow(data);
  },

  // Only open items — used for agenda generation (reappear until done)
  async listOpenByOwner(ownerId: string): Promise<ActionItem[]> {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('status', 'open')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('actionItems.listOpenByOwner:', error);
      return [];
    }
    return (data ?? []).map(mapRow);
  },

  // All items (open + done) for a given owner
  async listByOwner(ownerId: string): Promise<ActionItem[]> {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('owner_id', ownerId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('actionItems.listByOwner:', error);
      return [];
    }
    return (data ?? []).map(mapRow);
  },

  // Items created in context of a specific 1:1
  async listByOneOnOne(oneOnOneId: string): Promise<ActionItem[]> {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('one_on_one_id', oneOnOneId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('actionItems.listByOneOnOne:', error);
      return [];
    }
    return (data ?? []).map(mapRow);
  },

  // Open items overdue by > daysThreshold days across a set of owners
  // Used for manager dashboard aging metric
  async listAgingByOwners(
    ownerIds: string[],
    daysThreshold = 14
  ): Promise<ActionItem[]> {
    if (ownerIds.length === 0) return [];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysThreshold);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .in('owner_id', ownerIds)
      .eq('status', 'open')
      .lt('due_date', cutoffStr)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('actionItems.listAgingByOwners:', error);
      return [];
    }
    return (data ?? []).map(mapRow);
  },

  async create(input: CreateActionItemInput): Promise<ActionItem | null> {
    const { data, error } = await supabase
      .from('action_items')
      .insert({
        one_on_one_id: input.oneOnOneId ?? null,
        owner_id:      input.ownerId,
        description:   input.description,
        due_date:      input.dueDate,
        status:        input.status ?? 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('actionItems.create:', error);
      return null;
    }
    return mapRow(data);
  },

  async update(id: string, input: UpdateActionItemInput): Promise<ActionItem | null> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.description !== undefined) patch.description = input.description;
    if (input.dueDate     !== undefined) patch.due_date    = input.dueDate;
    if (input.status      !== undefined) patch.status      = input.status;

    const { data, error } = await supabase
      .from('action_items')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('actionItems.update:', error);
      return null;
    }
    return mapRow(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('action_items').delete().eq('id', id);
    if (error) {
      console.error('actionItems.delete:', error);
      return false;
    }
    return true;
  },
};

function mapRow(db: Record<string, unknown>): ActionItem {
  return {
    id:          db.id            as string,
    oneOnOneId:  (db.one_on_one_id as string | null) ?? null,
    ownerId:     db.owner_id      as string,
    description: db.description   as string,
    dueDate:     db.due_date      as string,
    status:      db.status        as 'open' | 'done',
    createdAt:   db.created_at    as string,
    updatedAt:   db.updated_at    as string,
  };
}
