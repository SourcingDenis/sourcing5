import { supabase } from '../client';
import type { AppSetting, UpdateSettingInput } from '@/lib/types';

export const settingsRepository = {
  async getByKey(key: string): Promise<AppSetting | null> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      console.error('settingsRepository.getByKey:', error);
      return null;
    }

    return mapRow(data);
  },

  async listAll(): Promise<AppSetting[]> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('key');

    if (error) {
      console.error('settingsRepository.listAll:', error);
      return [];
    }

    return (data ?? []).map(mapRow);
  },

  async upsert(key: string, input: UpdateSettingInput): Promise<AppSetting | null> {
    const { data, error } = await supabase
      .from('app_settings')
      .upsert(
        { key, value: input.value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (error) {
      console.error('settingsRepository.upsert:', error);
      return null;
    }

    return mapRow(data);
  },
};

function mapRow(db: Record<string, unknown>): AppSetting {
  return {
    key: db.key as string,
    value: db.value as string,
    description: (db.description as string) ?? undefined,
    updatedAt: db.updated_at as string,
  };
}
