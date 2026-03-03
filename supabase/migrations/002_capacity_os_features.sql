-- Add priority column to assignments table
ALTER TABLE assignments ADD COLUMN priority priority_level NOT NULL DEFAULT 'medium';

-- Create capacity_snapshots table
CREATE TABLE capacity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  total_capacity_hours INT NOT NULL,
  allocated_hours INT NOT NULL,
  load_ratio DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

CREATE INDEX idx_capacity_snapshots_user_id ON capacity_snapshots(user_id);
CREATE INDEX idx_capacity_snapshots_week_start ON capacity_snapshots(week_start);

-- Enable RLS on capacity_snapshots
ALTER TABLE capacity_snapshots ENABLE ROW LEVEL SECURITY;

-- Extend RLS: allow authenticated users to write to all tables

-- users write policies
CREATE POLICY "Allow authenticated users to insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update users"
  ON users FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete users"
  ON users FOR DELETE
  TO authenticated
  USING (true);

-- reqs write policies
CREATE POLICY "Allow authenticated users to insert reqs"
  ON reqs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update reqs"
  ON reqs FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete reqs"
  ON reqs FOR DELETE
  TO authenticated
  USING (true);

-- assignments write policies
CREATE POLICY "Allow authenticated users to insert assignments"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update assignments"
  ON assignments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete assignments"
  ON assignments FOR DELETE
  TO authenticated
  USING (true);

-- capacity_snapshots policies
CREATE POLICY "Allow authenticated users to read snapshots"
  ON capacity_snapshots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert snapshots"
  ON capacity_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update snapshots"
  ON capacity_snapshots FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================
-- Seed data: 1 lead + 6 sourcers, sample reqs, assignments
-- ============================================================

-- Insert lead
INSERT INTO users (id, name, email, role, weekly_capacity_hours) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alex Morgan', 'alex.morgan@company.com', 'lead', 40);

-- Insert 6 sourcers with manager_id pointing to the lead
INSERT INTO users (id, name, email, role, manager_id, weekly_capacity_hours) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Jamie Lee',    'jamie.lee@company.com',    'sourcer', '00000000-0000-0000-0000-000000000001', 40),
  ('00000000-0000-0000-0000-000000000003', 'Sam Rivera',   'sam.rivera@company.com',   'sourcer', '00000000-0000-0000-0000-000000000001', 40),
  ('00000000-0000-0000-0000-000000000004', 'Taylor Kim',   'taylor.kim@company.com',   'sourcer', '00000000-0000-0000-0000-000000000001', 40),
  ('00000000-0000-0000-0000-000000000005', 'Jordan Chen',  'jordan.chen@company.com',  'sourcer', '00000000-0000-0000-0000-000000000001', 40),
  ('00000000-0000-0000-0000-000000000006', 'Casey Park',   'casey.park@company.com',   'sourcer', '00000000-0000-0000-0000-000000000001', 32),
  ('00000000-0000-0000-0000-000000000007', 'Riley Nguyen', 'riley.nguyen@company.com', 'sourcer', '00000000-0000-0000-0000-000000000001', 40);

-- Insert sample requisitions
INSERT INTO reqs (id, title, function, level, location, priority) VALUES
  ('REQ-001', 'Senior Software Engineer',     'Engineering',  'Senior',     'Remote',        'critical'),
  ('REQ-002', 'Product Manager',              'Product',      'Mid',        'New York',      'high'),
  ('REQ-003', 'Data Scientist',               'Data',         'Senior',     'San Francisco', 'high'),
  ('REQ-004', 'UX Designer',                  'Design',       'Mid',        'Remote',        'medium'),
  ('REQ-005', 'DevOps Engineer',              'Engineering',  'Senior',     'Austin',        'high'),
  ('REQ-006', 'Marketing Manager',            'Marketing',    'Mid',        'New York',      'medium'),
  ('REQ-007', 'Sales Engineer',               'Sales',        'Mid',        'Remote',        'low'),
  ('REQ-008', 'Staff Engineer',               'Engineering',  'Staff',      'Remote',        'critical');

-- Insert assignments (varied loads):
-- Jamie Lee:   32h / 40h = 0.8  (yellow boundary)
-- Sam Rivera:  44h / 40h = 1.1  (red - over capacity)
-- Taylor Kim:  24h / 40h = 0.6  (green)
-- Jordan Chen: 36h / 40h = 0.9  (yellow)
-- Casey Park:  28h / 32h = 0.875 (yellow)
-- Riley Nguyen: 12h / 40h = 0.3 (green)
-- Alex Morgan (lead): 16h / 40h = 0.4 (green)

INSERT INTO assignments (user_id, req_id, priority, estimated_hours_per_week, status) VALUES
  -- Jamie Lee (0.8)
  ('00000000-0000-0000-0000-000000000002', 'REQ-001', 'critical', 20, 'active'),
  ('00000000-0000-0000-0000-000000000002', 'REQ-004', 'medium',   12, 'active'),

  -- Sam Rivera (over capacity 1.1)
  ('00000000-0000-0000-0000-000000000003', 'REQ-002', 'high',     20, 'active'),
  ('00000000-0000-0000-0000-000000000003', 'REQ-005', 'high',     16, 'active'),
  ('00000000-0000-0000-0000-000000000003', 'REQ-008', 'critical',  8, 'active'),

  -- Taylor Kim (green 0.6)
  ('00000000-0000-0000-0000-000000000004', 'REQ-003', 'high',     24, 'active'),

  -- Jordan Chen (yellow 0.9)
  ('00000000-0000-0000-0000-000000000005', 'REQ-001', 'critical', 20, 'active'),
  ('00000000-0000-0000-0000-000000000005', 'REQ-006', 'medium',   16, 'active'),

  -- Casey Park (yellow 0.875)
  ('00000000-0000-0000-0000-000000000006', 'REQ-007', 'low',      16, 'active'),
  ('00000000-0000-0000-0000-000000000006', 'REQ-004', 'medium',   12, 'active'),

  -- Riley Nguyen (green 0.3)
  ('00000000-0000-0000-0000-000000000007', 'REQ-008', 'critical', 12, 'active'),

  -- Alex Morgan lead (green 0.4)
  ('00000000-0000-0000-0000-000000000001', 'REQ-002', 'high',     16, 'active'),

  -- A couple of paused/closed for realistic data
  ('00000000-0000-0000-0000-000000000004', 'REQ-007', 'low',      8, 'paused'),
  ('00000000-0000-0000-0000-000000000007', 'REQ-006', 'medium',   8, 'closed');
