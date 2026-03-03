-- ============================================================
-- Migration 003: Funnel Radar + App Settings
-- ============================================================

-- ============================================================
-- app_settings table — stores key/value configuration including
-- the Ashby API key entered via the UI (never in env vars)
-- ============================================================
CREATE TABLE app_settings (
  key         TEXT        PRIMARY KEY,
  value       TEXT        NOT NULL DEFAULT '',
  description TEXT,
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_settings_select"
  ON app_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "app_settings_insert"
  ON app_settings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "app_settings_update"
  ON app_settings FOR UPDATE TO authenticated USING (true);

-- Seed default settings rows (value is empty — user fills via UI)
INSERT INTO app_settings (key, value, description) VALUES
  ('ashby_api_key',  '', 'Ashby ATS API key — set via the Integrations settings page'),
  ('ashby_base_url', 'https://api.ashbyhq.com', 'Ashby API base URL');

-- ============================================================
-- Add Ashby tracking columns to reqs
-- ============================================================
ALTER TABLE reqs
  ADD COLUMN IF NOT EXISTS ashby_job_id   TEXT,
  ADD COLUMN IF NOT EXISTS ashby_status   TEXT,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reqs_ashby_job_id
  ON reqs(ashby_job_id)
  WHERE ashby_job_id IS NOT NULL;

-- ============================================================
-- funnel_metrics table
-- ============================================================
DROP TABLE IF EXISTS funnel_metrics;

CREATE TABLE funnel_metrics (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  req_id            TEXT        NOT NULL REFERENCES reqs(id)   ON DELETE CASCADE,
  week_start_date   DATE        NOT NULL,

  -- Manually entered outreach counts
  outreach_sent     INT         NOT NULL DEFAULT 0 CHECK (outreach_sent     >= 0),
  replies           INT         NOT NULL DEFAULT 0 CHECK (replies           >= 0),
  positive_replies  INT         NOT NULL DEFAULT 0 CHECK (positive_replies  >= 0),

  -- Auto-populated from Ashby sync
  screens_booked    INT         NOT NULL DEFAULT 0 CHECK (screens_booked    >= 0),

  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- One record per sourcer / req / week
  UNIQUE(user_id, req_id, week_start_date)
);

CREATE INDEX idx_funnel_metrics_user_id    ON funnel_metrics(user_id);
CREATE INDEX idx_funnel_metrics_req_id     ON funnel_metrics(req_id);
CREATE INDEX idx_funnel_metrics_week_start ON funnel_metrics(week_start_date);
CREATE INDEX idx_funnel_metrics_user_week  ON funnel_metrics(user_id, week_start_date DESC);

ALTER TABLE funnel_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "funnel_metrics_select"
  ON funnel_metrics FOR SELECT TO authenticated USING (true);

CREATE POLICY "funnel_metrics_insert"
  ON funnel_metrics FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "funnel_metrics_update"
  ON funnel_metrics FOR UPDATE TO authenticated USING (true);

CREATE POLICY "funnel_metrics_delete"
  ON funnel_metrics FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Seed: 2 weeks of funnel data for existing sourcers & reqs
-- week1 = current week, week2 = prior week (for WoW alerting)
-- ============================================================
DO $$
DECLARE
  week1 DATE := date_trunc('week', CURRENT_DATE)::DATE;
  week2 DATE := (date_trunc('week', CURRENT_DATE) - INTERVAL '7 days')::DATE;
BEGIN

INSERT INTO funnel_metrics
  (user_id, req_id, week_start_date, outreach_sent, replies, positive_replies, screens_booked)
VALUES
  -- Jamie Lee / REQ-001 (healthy funnel)
  ('00000000-0000-0000-0000-000000000002','REQ-001', week1, 40, 8,  4, 3),
  ('00000000-0000-0000-0000-000000000002','REQ-001', week2, 38, 7,  4, 2),

  -- Jamie Lee / REQ-004 (reply_rate ~10% → RED alert)
  ('00000000-0000-0000-0000-000000000002','REQ-004', week1, 30, 3,  1, 0),
  ('00000000-0000-0000-0000-000000000002','REQ-004', week2, 28, 5,  2, 1),

  -- Sam Rivera / REQ-002 (zero outreach → WARNING)
  ('00000000-0000-0000-0000-000000000003','REQ-002', week1,  0, 0,  0, 0),
  ('00000000-0000-0000-0000-000000000003','REQ-002', week2, 35, 6,  3, 2),

  -- Sam Rivera / REQ-005 (healthy)
  ('00000000-0000-0000-0000-000000000003','REQ-005', week1, 25, 5,  2, 1),
  ('00000000-0000-0000-0000-000000000003','REQ-005', week2, 40, 8,  3, 3),

  -- Taylor Kim / REQ-003 (WoW drop > 30% → FLAG)
  ('00000000-0000-0000-0000-000000000004','REQ-003', week1, 20, 4,  2, 1),
  ('00000000-0000-0000-0000-000000000004','REQ-003', week2, 35, 9,  5, 3),

  -- Jordan Chen / REQ-001 (healthy)
  ('00000000-0000-0000-0000-000000000005','REQ-001', week1, 45, 9,  5, 4),
  ('00000000-0000-0000-0000-000000000005','REQ-001', week2, 42, 8,  4, 3),

  -- Jordan Chen / REQ-006 (healthy)
  ('00000000-0000-0000-0000-000000000005','REQ-006', week1, 30, 6,  3, 2),
  ('00000000-0000-0000-0000-000000000005','REQ-006', week2, 32, 7,  4, 2),

  -- Casey Park / REQ-007
  ('00000000-0000-0000-0000-000000000006','REQ-007', week1, 15, 3,  1, 1),
  ('00000000-0000-0000-0000-000000000006','REQ-007', week2, 18, 4,  2, 1),

  -- Riley Nguyen / REQ-008 (strong funnel)
  ('00000000-0000-0000-0000-000000000007','REQ-008', week1, 50,10,  6, 5),
  ('00000000-0000-0000-0000-000000000007','REQ-008', week2, 48, 9,  5, 4);

END $$;
