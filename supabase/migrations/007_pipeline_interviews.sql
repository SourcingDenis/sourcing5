-- ============================================================
-- Migration 007: Pipeline Stages + Interview Tracking
-- ============================================================

-- pipeline_stages: one row per req + Ashby stage, updated on each sync
CREATE TABLE pipeline_stages (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  req_id           TEXT        NOT NULL REFERENCES reqs(id) ON DELETE CASCADE,
  ashby_stage_id   TEXT        NOT NULL,
  stage_name       TEXT        NOT NULL,
  order_index      INT         NOT NULL DEFAULT 0,
  candidate_count  INT         NOT NULL DEFAULT 0 CHECK (candidate_count >= 0),
  last_synced_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  UNIQUE(req_id, ashby_stage_id)
);

CREATE INDEX idx_pipeline_stages_req_id ON pipeline_stages(req_id);
CREATE INDEX idx_pipeline_stages_order  ON pipeline_stages(req_id, order_index);

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pipeline_stages_select" ON pipeline_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "pipeline_stages_insert" ON pipeline_stages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pipeline_stages_update" ON pipeline_stages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "pipeline_stages_delete" ON pipeline_stages FOR DELETE TO authenticated USING (true);

-- interviews: tracks each scheduled/completed interview pulled from Ashby
CREATE TABLE interviews (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  req_id             TEXT        NOT NULL REFERENCES reqs(id) ON DELETE CASCADE,
  ashby_schedule_id  TEXT        NOT NULL UNIQUE,
  application_id     TEXT        NOT NULL,
  stage_name         TEXT        NOT NULL,
  status             TEXT        NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  scheduled_at       TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at       TIMESTAMP WITH TIME ZONE,
  last_synced_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interviews_req_id      ON interviews(req_id);
CREATE INDEX idx_interviews_status      ON interviews(status);
CREATE INDEX idx_interviews_scheduled   ON interviews(scheduled_at);
CREATE INDEX idx_interviews_application ON interviews(application_id);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interviews_select" ON interviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "interviews_insert" ON interviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "interviews_update" ON interviews FOR UPDATE TO authenticated USING (true);
CREATE POLICY "interviews_delete" ON interviews FOR DELETE TO authenticated USING (true);
