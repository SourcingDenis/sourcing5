import { supabase } from '../client';
import type {
  Experiment,
  ExperimentVariant,
  ExperimentResult,
  CreateExperimentInput,
  UpdateExperimentInput,
  CreateVariantInput,
  CreateResultInput,
} from '@/lib/types/experiment';

export const experimentsRepository = {
  // ----------------------------------------------------------------
  // Experiments
  // ----------------------------------------------------------------

  async listAll(): Promise<(Experiment & { ownerName: string })[]> {
    const { data, error } = await supabase
      .from('experiments')
      .select('*, users!experiments_owner_id_fkey (id, name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('experiments.listAll:', error);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      ...mapExperimentRow(row),
      ownerName: (row.users as { name: string } | null)?.name ?? 'Unknown',
    }));
  },

  async getById(id: string): Promise<(Experiment & { ownerName: string }) | null> {
    const { data, error } = await supabase
      .from('experiments')
      .select('*, users!experiments_owner_id_fkey (id, name)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('experiments.getById:', error);
      return null;
    }

    return {
      ...mapExperimentRow(data),
      ownerName: (data.users as { name: string } | null)?.name ?? 'Unknown',
    };
  },

  async create(input: CreateExperimentInput): Promise<Experiment | null> {
    const { data, error } = await supabase
      .from('experiments')
      .insert({
        name:       input.name,
        hypothesis: input.hypothesis,
        start_date: input.startDate,
        end_date:   input.endDate ?? null,
        owner_id:   input.ownerId,
      })
      .select()
      .single();

    if (error) {
      console.error('experiments.create:', error);
      return null;
    }

    return mapExperimentRow(data);
  },

  async update(id: string, input: UpdateExperimentInput): Promise<Experiment | null> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.status !== undefined) updateData.status = input.status;
    if (input.endDate !== undefined) updateData.end_date = input.endDate;

    const { data, error } = await supabase
      .from('experiments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('experiments.update:', error);
      return null;
    }

    return mapExperimentRow(data);
  },

  // ----------------------------------------------------------------
  // Variants
  // ----------------------------------------------------------------

  async listVariantsByExperiment(experimentId: string): Promise<ExperimentVariant[]> {
    const { data, error } = await supabase
      .from('experiment_variants')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('experiments.listVariantsByExperiment:', error);
      return [];
    }

    return (data ?? []).map(mapVariantRow);
  },

  async createVariant(input: CreateVariantInput): Promise<ExperimentVariant | null> {
    const { data, error } = await supabase
      .from('experiment_variants')
      .insert({
        experiment_id: input.experimentId,
        name:          input.name,
        description:   input.description,
      })
      .select()
      .single();

    if (error) {
      console.error('experiments.createVariant:', error);
      return null;
    }

    return mapVariantRow(data);
  },

  // ----------------------------------------------------------------
  // Results
  // ----------------------------------------------------------------

  async listResultsByVariant(variantId: string): Promise<ExperimentResult[]> {
    const { data, error } = await supabase
      .from('experiment_results')
      .select('*')
      .eq('variant_id', variantId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('experiments.listResultsByVariant:', error);
      return [];
    }

    return (data ?? []).map(mapResultRow);
  },

  async listResultsByVariantIds(variantIds: string[]): Promise<ExperimentResult[]> {
    if (variantIds.length === 0) return [];

    const { data, error } = await supabase
      .from('experiment_results')
      .select('*')
      .in('variant_id', variantIds);

    if (error) {
      console.error('experiments.listResultsByVariantIds:', error);
      return [];
    }

    return (data ?? []).map(mapResultRow);
  },

  async createResult(input: CreateResultInput): Promise<ExperimentResult | null> {
    const { data, error } = await supabase
      .from('experiment_results')
      .insert({
        variant_id:       input.variantId,
        outreach_sent:    input.outreachSent,
        replies:          input.replies,
        positive_replies: input.positiveReplies,
      })
      .select()
      .single();

    if (error) {
      console.error('experiments.createResult:', error);
      return null;
    }

    return mapResultRow(data);
  },
};

// ----------------------------------------------------------------
// Row mappers
// ----------------------------------------------------------------

function mapExperimentRow(db: Record<string, unknown>): Experiment {
  return {
    id:         db.id as string,
    name:       db.name as string,
    hypothesis: db.hypothesis as string,
    startDate:  db.start_date as string,
    endDate:    db.end_date as string | null,
    ownerId:    db.owner_id as string,
    status:     db.status as 'active' | 'completed',
    createdAt:  db.created_at as string,
    updatedAt:  db.updated_at as string,
  };
}

function mapVariantRow(db: Record<string, unknown>): ExperimentVariant {
  return {
    id:           db.id as string,
    experimentId: db.experiment_id as string,
    name:         db.name as string,
    description:  db.description as string,
    createdAt:    db.created_at as string,
  };
}

function mapResultRow(db: Record<string, unknown>): ExperimentResult {
  return {
    id:              db.id as string,
    variantId:       db.variant_id as string,
    outreachSent:    db.outreach_sent as number,
    replies:         db.replies as number,
    positiveReplies: db.positive_replies as number,
    createdAt:       db.created_at as string,
  };
}
