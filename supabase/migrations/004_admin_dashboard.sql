-- Add admin role to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Add is_active column to users table (default true for existing users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Create ashby_roles table to store synced roles/departments from Ashby
CREATE TABLE IF NOT EXISTS ashby_roles (
  id TEXT PRIMARY KEY,                       -- Ashby department/team ID
  name TEXT NOT NULL,                        -- Role/department name
  type TEXT NOT NULL DEFAULT 'department',   -- 'department' | 'team' | 'job'
  parent_id TEXT REFERENCES ashby_roles(id) ON DELETE SET NULL,
  ashby_data JSONB,                          -- Raw Ashby API response
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ashby_roles_type ON ashby_roles(type);

-- Enable RLS
ALTER TABLE ashby_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read ashby_roles"
  ON ashby_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage ashby_roles"
  ON ashby_roles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create sourcer_role_assignments table (assign ashby role/req to a sourcer)
CREATE TABLE IF NOT EXISTS sourcer_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ashby_role_id TEXT REFERENCES ashby_roles(id) ON DELETE SET NULL,
  req_id TEXT REFERENCES reqs(id) ON DELETE CASCADE,
  notes TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT sourcer_role_assignments_target_check
    CHECK (ashby_role_id IS NOT NULL OR req_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_sra_user_id ON sourcer_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_sra_req_id ON sourcer_role_assignments(req_id);
CREATE INDEX IF NOT EXISTS idx_sra_ashby_role_id ON sourcer_role_assignments(ashby_role_id);

ALTER TABLE sourcer_role_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read sourcer_role_assignments"
  ON sourcer_role_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage sourcer_role_assignments"
  ON sourcer_role_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
