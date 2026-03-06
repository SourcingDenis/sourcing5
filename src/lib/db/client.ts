import { createClient } from '@supabase/supabase-js';

// Fall back to placeholder values at build time so module evaluation doesn't throw.
// Real values must be provided via environment variables at runtime.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side admin client that bypasses RLS — use only in API routes
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          manager_id: string | null;
          weekly_capacity_hours: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: string;
          manager_id?: string | null;
          weekly_capacity_hours?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          role?: string;
          manager_id?: string | null;
          weekly_capacity_hours?: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          lead_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          lead_id: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          lead_id?: string;
        };
        Relationships: [];
      };
      reqs: {
        Row: {
          id: string;
          title: string;
          function: string;
          level: string;
          location: string;
          priority: string;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          function: string;
          level: string;
          location: string;
          priority?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          function?: string;
          level?: string;
          location?: string;
          priority?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          id: string;
          user_id: string;
          req_id: string;
          priority: string;
          estimated_hours_per_week: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          req_id: string;
          priority?: string;
          estimated_hours_per_week: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          priority?: string;
          estimated_hours_per_week?: number;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      capacity_snapshots: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          total_capacity_hours: number;
          allocated_hours: number;
          load_ratio: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          total_capacity_hours: number;
          allocated_hours: number;
          load_ratio: number;
          created_at?: string;
        };
        Update: {
          total_capacity_hours?: number;
          allocated_hours?: number;
          load_ratio?: number;
        };
        Relationships: [];
      };
      funnel_metrics: {
        Row: {
          id: string;
          user_id: string;
          req_id: string;
          week_start_date: string;
          outreach_sent: number;
          replies: number;
          positive_replies: number;
          screens_booked: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          req_id: string;
          week_start_date: string;
          outreach_sent: number;
          replies: number;
          positive_replies: number;
          screens_booked?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          outreach_sent?: number;
          replies?: number;
          positive_replies?: number;
          screens_booked?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          key: string;
          value: string;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          value?: string;
          description?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      one_on_ones: {
        Row: {
          id: string;
          manager_id: string;
          report_id: string;
          scheduled_at: string;
          completed_at: string | null;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          manager_id: string;
          report_id: string;
          scheduled_at: string;
          completed_at?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          scheduled_at?: string;
          completed_at?: string | null;
          summary?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      action_items: {
        Row: {
          id: string;
          one_on_one_id: string | null;
          owner_id: string;
          description: string;
          due_date: string;
          status: 'open' | 'done';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          one_on_one_id?: string | null;
          owner_id: string;
          description: string;
          due_date: string;
          status?: 'open' | 'done';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          description?: string;
          due_date?: string;
          status?: 'open' | 'done';
          updated_at?: string;
        };
        Relationships: [];
      };
      outreach_samples: {
        Row: {
          id: string;
          user_id: string;
          req_id: string;
          message_text: string;
          week_start_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          req_id: string;
          message_text: string;
          week_start_date: string;
          created_at?: string;
        };
        Update: {
          message_text?: string;
          week_start_date?: string;
        };
        Relationships: [];
      };
      quality_reviews: {
        Row: {
          id: string;
          outreach_sample_id: string;
          reviewer_id: string;
          personalization_score: number;
          relevance_score: number;
          clarity_score: number;
          cta_score: number;
          overall_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          outreach_sample_id: string;
          reviewer_id: string;
          personalization_score: number;
          relevance_score: number;
          clarity_score: number;
          cta_score: number;
          created_at?: string;
        };
        Update: {
          personalization_score?: number;
          relevance_score?: number;
          clarity_score?: number;
          cta_score?: number;
        };
        Relationships: [];
      };
      experiments: {
        Row: {
          id: string;
          name: string;
          hypothesis: string;
          start_date: string;
          end_date: string | null;
          owner_id: string;
          status: 'active' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          hypothesis: string;
          start_date: string;
          end_date?: string | null;
          owner_id: string;
          status?: 'active' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'active' | 'completed';
          end_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      experiment_variants: {
        Row: {
          id: string;
          experiment_id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
        };
        Relationships: [];
      };
      experiment_results: {
        Row: {
          id: string;
          variant_id: string;
          outreach_sent: number;
          replies: number;
          positive_replies: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          outreach_sent: number;
          replies: number;
          positive_replies: number;
          created_at?: string;
        };
        Update: {
          outreach_sent?: number;
          replies?: number;
          positive_replies?: number;
        };
        Relationships: [];
      };
      ashby_roles: {
        Row: {
          id: string;
          name: string;
          type: string;
          parent_id: string | null;
          ashby_data: Record<string, unknown> | null;
          synced_at: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          type: string;
          parent_id?: string | null;
          ashby_data?: Record<string, unknown> | null;
          synced_at: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          type?: string;
          parent_id?: string | null;
          ashby_data?: Record<string, unknown> | null;
          synced_at?: string;
        };
        Relationships: [];
      };
      sourcer_role_assignments: {
        Row: {
          id: string;
          user_id: string;
          ashby_role_id: string | null;
          req_id: string | null;
          notes: string | null;
          assigned_at: string;
          assigned_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          ashby_role_id?: string | null;
          req_id?: string | null;
          notes?: string | null;
          assigned_at?: string;
          assigned_by?: string | null;
        };
        Update: {
          ashby_role_id?: string | null;
          req_id?: string | null;
          notes?: string | null;
          assigned_by?: string | null;
        };
        Relationships: [];
      };
      pipeline_stages: {
        Row: {
          id: string;
          req_id: string;
          ashby_stage_id: string;
          stage_name: string;
          order_index: number;
          candidate_count: number;
          last_synced_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          req_id: string;
          ashby_stage_id: string;
          stage_name: string;
          order_index?: number;
          candidate_count?: number;
          last_synced_at?: string;
          created_at?: string;
        };
        Update: {
          stage_name?: string;
          order_index?: number;
          candidate_count?: number;
          last_synced_at?: string;
        };
        Relationships: [];
      };
      interviews: {
        Row: {
          id: string;
          req_id: string;
          ashby_schedule_id: string;
          application_id: string;
          stage_name: string;
          status: string;
          scheduled_at: string;
          completed_at: string | null;
          last_synced_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          req_id: string;
          ashby_schedule_id: string;
          application_id: string;
          stage_name: string;
          status?: string;
          scheduled_at: string;
          completed_at?: string | null;
          last_synced_at?: string;
          created_at?: string;
        };
        Update: {
          stage_name?: string;
          status?: string;
          scheduled_at?: string;
          completed_at?: string | null;
          last_synced_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
