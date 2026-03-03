-- Create enums
CREATE TYPE user_role AS ENUM ('lead', 'sourcer');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE assignment_status AS ENUM ('active', 'paused', 'closed');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'sourcer',
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  weekly_capacity_hours INT NOT NULL DEFAULT 40,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_manager_id ON users(manager_id);

-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lead_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on teams
CREATE INDEX idx_teams_lead_id ON teams(lead_id);

-- Create reqs table (requisitions)
CREATE TABLE reqs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  function TEXT NOT NULL,
  level TEXT NOT NULL,
  location TEXT NOT NULL,
  priority priority_level NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on reqs
CREATE INDEX idx_reqs_priority ON reqs(priority);
CREATE INDEX idx_reqs_created_at ON reqs(created_at);

-- Create assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  req_id TEXT NOT NULL REFERENCES reqs(id) ON DELETE CASCADE,
  estimated_hours_per_week INT NOT NULL,
  status assignment_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on assignments
CREATE INDEX idx_assignments_user_id ON assignments(user_id);
CREATE INDEX idx_assignments_req_id ON assignments(req_id);
CREATE INDEX idx_assignments_status ON assignments(status);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE reqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow authenticated users to read data)
CREATE POLICY "Allow authenticated users to read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read reqs"
  ON reqs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (true);
