import { supabase } from '../client';
import type { PipelineStage, UpsertPipelineStageInput } from '@/lib/types';

export const pipelineStagesRepository = {
  async listByReq(reqId: string): Promise<PipelineStage[]> {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('req_id', reqId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('pipelineStages.listByReq:', error);
      return [];
    }

    return (data ?? []).map(mapRow);
  },

  async listAllGroupedByReq(): Promise<Map<string, PipelineStage[]>> {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .order('req_id')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('pipelineStages.listAllGroupedByReq:', error);
      return new Map();
    }

    const grouped = new Map<string, PipelineStage[]>();
    for (const row of data ?? []) {
      const stage = mapRow(row);
      const list = grouped.get(stage.reqId) ?? [];
      list.push(stage);
      grouped.set(stage.reqId, list);
    }

    return grouped;
  },

  async upsert(input: UpsertPipelineStageInput): Promise<PipelineStage | null> {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .upsert(
        {
          req_id: input.reqId,
          ashby_stage_id: input.ashbyStageId,
          stage_name: input.stageName,
          order_index: input.orderIndex,
          candidate_count: input.candidateCount,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: 'req_id,ashby_stage_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('pipelineStages.upsert:', error);
      return null;
    }

    return mapRow(data);
  },

  async deleteStaleStages(reqId: string, activeAshbyStageIds: string[]): Promise<boolean> {
    if (activeAshbyStageIds.length === 0) return true;

    const { error } = await supabase
      .from('pipeline_stages')
      .delete()
      .eq('req_id', reqId)
      .not('ashby_stage_id', 'in', `(${activeAshbyStageIds.map((id) => `"${id}"`).join(',')})`);

    if (error) {
      console.error('pipelineStages.deleteStaleStages:', error);
      return false;
    }

    return true;
  },
};

function mapRow(db: Record<string, unknown>): PipelineStage {
  return {
    id: db.id as string,
    reqId: db.req_id as string,
    ashbyStageId: db.ashby_stage_id as string,
    stageName: db.stage_name as string,
    orderIndex: db.order_index as number,
    candidateCount: db.candidate_count as number,
    lastSyncedAt: db.last_synced_at as string,
    createdAt: db.created_at as string,
  };
}
