import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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
        };
        Insert: {
          id: string;
          title: string;
          function: string;
          level: string;
          location: string;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          created_at?: string;
        };
        Update: {
          title?: string;
          function?: string;
          level?: string;
          location?: string;
          priority?: 'low' | 'medium' | 'high' | 'critical';
        };
      };
      assignments: {
        Row: {
          id: string;
          user_id: string;
          req_id: string;
          estimated_hours_per_week: number;
          status: 'active' | 'paused' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          req_id: string;
          estimated_hours_per_week: number;
          status?: 'active' | 'paused' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          estimated_hours_per_week?: number;
          status?: 'active' | 'paused' | 'closed';
          updated_at?: string;
        };
      };
    };
  };
};
