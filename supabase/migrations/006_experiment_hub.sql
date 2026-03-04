-- ============================================================
-- Migration 006: Experiment Hub
-- A/B testing module for outreach strategy experiments
-- ============================================================

-- ============================================================
-- experiments — top-level A/B test record
-- ============================================================
CREATE TABLE experiments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  hypothesis  TEXT        NOT NULL,
  start_date  DATE        NOT NULL,
  end_date    DATE,
  owner_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'completed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experiments_owner_id ON experiments(owner_id);
CREATE INDEX idx_experiments_status   ON experiments(status);
CREATE INDEX idx_experiments_created  ON experiments(created_at DESC);

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiments_select" ON experiments FOR SELECT TO authenticated USING (true);
CREATE POLICY "experiments_insert" ON experiments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "experiments_update" ON experiments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "experiments_delete" ON experiments FOR DELETE TO authenticated USING (true);

-- ============================================================
-- experiment_variants — individual arms of an experiment
-- First inserted (lowest created_at) is the control arm.
-- ============================================================
CREATE TABLE experiment_variants (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id  UUID        NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  description    TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experiment_variants_exp_id ON experiment_variants(experiment_id);

ALTER TABLE experiment_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiment_variants_select" ON experiment_variants FOR SELECT TO authenticated USING (true);
CREATE POLICY "experiment_variants_insert" ON experiment_variants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "experiment_variants_update" ON experiment_variants FOR UPDATE TO authenticated USING (true);
CREATE POLICY "experiment_variants_delete" ON experiment_variants FOR DELETE TO authenticated USING (true);

-- ============================================================
-- experiment_results — result data logged per variant
-- Multiple rows per variant are allowed (additive); service sums them.
-- ============================================================
CREATE TABLE experiment_results (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id       UUID    NOT NULL REFERENCES experiment_variants(id) ON DELETE CASCADE,
  outreach_sent    INT     NOT NULL DEFAULT 0 CHECK (outreach_sent >= 0),
  replies          INT     NOT NULL DEFAULT 0 CHECK (replies >= 0),
  positive_replies INT     NOT NULL DEFAULT 0 CHECK (positive_replies >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experiment_results_variant_id ON experiment_results(variant_id);

ALTER TABLE experiment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiment_results_select" ON experiment_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "experiment_results_insert" ON experiment_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "experiment_results_update" ON experiment_results FOR UPDATE TO authenticated USING (true);
CREATE POLICY "experiment_results_delete" ON experiment_results FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Seed data
-- owner_id = lead user: 00000000-0000-0000-0000-000000000001
-- ============================================================
DO $$
DECLARE
  exp1    UUID := 'e0000000-0000-0000-0000-000000000001';
  exp2    UUID := 'e0000000-0000-0000-0000-000000000002';

  v1_ctrl UUID := 'e1000000-0000-0000-0000-000000000001';
  v1_a    UUID := 'e1000000-0000-0000-0000-000000000002';
  v1_b    UUID := 'e1000000-0000-0000-0000-000000000003';

  v2_ctrl UUID := 'e2000000-0000-0000-0000-000000000001';
  v2_a    UUID := 'e2000000-0000-0000-0000-000000000002';

  owner   UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

-- Experiment 1: Subject Line Personalization (completed, 3 variants)
INSERT INTO experiments (id, name, hypothesis, start_date, end_date, owner_id, status)
VALUES (
  exp1,
  'Subject Line Personalization Test',
  'Including the candidate''s current company name in the subject line will increase reply rate by at least 5 percentage points compared to a generic subject line.',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE - INTERVAL '3 days',
  owner,
  'completed'
);

INSERT INTO experiment_variants (id, experiment_id, name, description, created_at) VALUES
  (v1_ctrl, exp1, 'Control',   'Generic subject: "Senior Engineer opportunity at Acme"',             NOW() - INTERVAL '30 days'),
  (v1_a,    exp1, 'Variant A', 'Personalized: "Loved your work at {{company}} — quick question"',   NOW() - INTERVAL '30 days' + INTERVAL '1 second'),
  (v1_b,    exp1, 'Variant B', 'Question-based: "Is now a good time to chat about platform eng?"',  NOW() - INTERVAL '30 days' + INTERVAL '2 seconds');

-- Variant A wins (reply_rate 32.7% vs control 18.2%)
INSERT INTO experiment_results (variant_id, outreach_sent, replies, positive_replies) VALUES
  (v1_ctrl, 55, 10, 4),
  (v1_a,    52, 17, 9),
  (v1_b,    50, 11, 4);

-- Experiment 2: Short vs Long Message (active, 2 variants)
INSERT INTO experiments (id, name, hypothesis, start_date, end_date, owner_id, status)
VALUES (
  exp2,
  'Short vs Long Message Format',
  'Messages under 80 words will achieve a higher reply rate than messages over 150 words because candidates respond better to concise outreach.',
  CURRENT_DATE - INTERVAL '14 days',
  NULL,
  owner,
  'active'
);

INSERT INTO experiment_variants (id, experiment_id, name, description, created_at) VALUES
  (v2_ctrl, exp2, 'Control',   'Long-form message (150+ words) with full role context and background', NOW() - INTERVAL '14 days'),
  (v2_a,    exp2, 'Variant A', 'Short-form message (<80 words) with single strong hook and CTA',      NOW() - INTERVAL '14 days' + INTERVAL '1 second');

-- Partial results (still running — short form trending ahead)
INSERT INTO experiment_results (variant_id, outreach_sent, replies, positive_replies) VALUES
  (v2_ctrl, 38, 7, 3),
  (v2_a,    35, 10, 5);

END $$;
