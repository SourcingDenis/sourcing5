import { createClient } from '@supabase/supabase-js';

// Fall back to placeholder values at build time so module evaluation doesn't throw.
// Real values must be provided via environment variables at runtime.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'lead' | 'sourcer';
          manager_id: string | null;
          weekly_capacity_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role?: 'lead' | 'sourcer';
          manager_id?: string | null;
          weekly_capacity_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          role?: 'lead' | 'sourcer';
          manager_id?: string | null;
          weekly_capacity_hours?: number;
          updated_at?: string;
        };
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
      };
      reqs: {
        Row: {
          id: string;
          title: string;
          function: string;
          level: string;
          location: string;
          priority: 'low' | 'medium' | 'high' | 'critical';
          created_at: string;
          ashby_job_id: string | null;
          ashby_status: string | null;
          last_synced_at: string | null;
        };
        Insert: {
          id: string;
          title: string;
          function: string;
          level: string;
          location: string;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          created_at?: string;
          ashby_job_id?: string | null;
          ashby_status?: string | null;
          last_synced_at?: string | null;
        };
        Update: {
          title?: string;
          function?: string;
          level?: string;
          location?: string;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          ashby_job_id?: string | null;
          ashby_status?: string | null;
          last_synced_at?: string | null;
        };
      };
      assignments: {
        Row: {
          id: string;
          user_id: string;
          req_id: string;
          priority: 'low' | 'medium' | 'high' | 'critical';
          estimated_hours_per_week: number;
          status: 'active' | 'paused' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          req_id: string;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          estimated_hours_per_week: number;
          status?: 'active' | 'paused' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          priority?: 'low' | 'medium' | 'high' | 'critical';
          estimated_hours_per_week?: number;
          status?: 'active' | 'paused' | 'closed';
          updated_at?: string;
        };
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
          outreach_sent?: number;
          replies?: number;
          positive_replies?: number;
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
      };
    };
  };
};
