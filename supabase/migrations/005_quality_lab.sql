-- ============================================================
-- Migration 005: Quality Lab
-- outreach_samples + quality_reviews tables
-- ============================================================

-- ============================================================
-- outreach_samples — stores message text submitted for review
-- ============================================================
CREATE TABLE outreach_samples (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  req_id          TEXT    NOT NULL REFERENCES reqs(id)  ON DELETE CASCADE,
  message_text    TEXT    NOT NULL,
  week_start_date DATE    NOT NULL,   -- ISO-week Monday; used for weekly bucketing
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outreach_samples_user_id    ON outreach_samples(user_id);
CREATE INDEX idx_outreach_samples_week_start ON outreach_samples(week_start_date);
CREATE INDEX idx_outreach_samples_user_week  ON outreach_samples(user_id, week_start_date DESC);

ALTER TABLE outreach_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outreach_samples_select"
  ON outreach_samples FOR SELECT TO authenticated USING (true);

CREATE POLICY "outreach_samples_insert"
  ON outreach_samples FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "outreach_samples_update"
  ON outreach_samples FOR UPDATE TO authenticated USING (true);

CREATE POLICY "outreach_samples_delete"
  ON outreach_samples FOR DELETE TO authenticated USING (true);

-- ============================================================
-- quality_reviews — 4-dimension scoring of outreach samples
-- overall_score is a Postgres generated column (stored)
-- ============================================================
CREATE TABLE quality_reviews (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  outreach_sample_id    UUID    NOT NULL REFERENCES outreach_samples(id) ON DELETE CASCADE,
  reviewer_id           UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  personalization_score INT     NOT NULL CHECK (personalization_score BETWEEN 1 AND 5),
  relevance_score       INT     NOT NULL CHECK (relevance_score       BETWEEN 1 AND 5),
  clarity_score         INT     NOT NULL CHECK (clarity_score         BETWEEN 1 AND 5),
  cta_score             INT     NOT NULL CHECK (cta_score             BETWEEN 1 AND 5),
  overall_score         NUMERIC(3,2) GENERATED ALWAYS AS (
    (personalization_score + relevance_score + clarity_score + cta_score) / 4.0
  ) STORED,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(outreach_sample_id, reviewer_id)   -- one review per reviewer per sample
);

CREATE INDEX idx_quality_reviews_sample   ON quality_reviews(outreach_sample_id);
CREATE INDEX idx_quality_reviews_reviewer ON quality_reviews(reviewer_id);

ALTER TABLE quality_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quality_reviews_select"
  ON quality_reviews FOR SELECT TO authenticated USING (true);

CREATE POLICY "quality_reviews_insert"
  ON quality_reviews FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "quality_reviews_update"
  ON quality_reviews FOR UPDATE TO authenticated USING (true);

CREATE POLICY "quality_reviews_delete"
  ON quality_reviews FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Seed: outreach samples + reviews for trend / correlation data
-- Covers current week and 3 prior weeks for seeded sourcers
-- ============================================================
DO $$
DECLARE
  w0 DATE := date_trunc('week', CURRENT_DATE)::DATE;          -- this week (Monday)
  w1 DATE := (date_trunc('week', CURRENT_DATE) - INTERVAL  '7 days')::DATE;
  w2 DATE := (date_trunc('week', CURRENT_DATE) - INTERVAL '14 days')::DATE;
  w3 DATE := (date_trunc('week', CURRENT_DATE) - INTERVAL '21 days')::DATE;

  -- Sample IDs for seeded rows (stable UUIDs so we can reference them in reviews)
  s01 UUID := 'a1000000-0000-0000-0000-000000000001';
  s02 UUID := 'a1000000-0000-0000-0000-000000000002';
  s03 UUID := 'a1000000-0000-0000-0000-000000000003';
  s04 UUID := 'a1000000-0000-0000-0000-000000000004';
  s05 UUID := 'a1000000-0000-0000-0000-000000000005';
  s06 UUID := 'a1000000-0000-0000-0000-000000000006';
  s07 UUID := 'a1000000-0000-0000-0000-000000000007';
  s08 UUID := 'a1000000-0000-0000-0000-000000000008';
  s09 UUID := 'a1000000-0000-0000-0000-000000000009';
  s10 UUID := 'a1000000-0000-0000-0000-000000000010';
  s11 UUID := 'a1000000-0000-0000-0000-000000000011';
  s12 UUID := 'a1000000-0000-0000-0000-000000000012';
  s13 UUID := 'a1000000-0000-0000-0000-000000000013';
  s14 UUID := 'a1000000-0000-0000-0000-000000000014';
  s15 UUID := 'a1000000-0000-0000-0000-000000000015';
  s16 UUID := 'a1000000-0000-0000-0000-000000000016';
  s17 UUID := 'a1000000-0000-0000-0000-000000000017';
  s18 UUID := 'a1000000-0000-0000-0000-000000000018';
  s19 UUID := 'a1000000-0000-0000-0000-000000000019';
  s20 UUID := 'a1000000-0000-0000-0000-000000000020';
  s21 UUID := 'a1000000-0000-0000-0000-000000000021';
  s22 UUID := 'a1000000-0000-0000-0000-000000000022';
  s23 UUID := 'a1000000-0000-0000-0000-000000000023';
  s24 UUID := 'a1000000-0000-0000-0000-000000000024';

  -- reviewer = first lead (00000000-...0001)
  reviewer UUID := '00000000-0000-0000-0000-000000000001';

BEGIN

-- -------------------------------------------------------
-- Jamie Lee (002) / REQ-001 — rising quality trend
-- -------------------------------------------------------
INSERT INTO outreach_samples (id, user_id, req_id, message_text, week_start_date) VALUES
  (s01,'00000000-0000-0000-0000-000000000002','REQ-001',
   'Hi {{first_name}}, I saw your work on distributed systems at {{company}} and immediately thought of our Staff Engineer role. We are building the next generation of real-time data pipelines and your background in Kafka and Flink is exactly what we need. Worth a 20-min call this week?',
   w3),
  (s02,'00000000-0000-0000-0000-000000000002','REQ-001',
   'Hey {{first_name}} — noticed you led the migration to microservices at {{company}}. We have a Staff Eng opening where you would own a similar greenfield initiative from day one. Happy to share the full scope if interested.',
   w2),
  (s03,'00000000-0000-0000-0000-000000000002','REQ-001',
   'Hi {{first_name}}, your open-source contributions to Apache Iceberg caught my eye. We are building a lakehouse platform and your experience is a direct fit. This is a Staff-level role with meaningful scope. Interested in learning more?',
   w1),
  (s04,'00000000-0000-0000-0000-000000000002','REQ-001',
   'Hi {{first_name}}, I have been following your writing on data mesh architecture — exactly the direction we are moving at {{company}}. Our Staff Engineer role would put you at the center of that transformation. Could we find 15 minutes this week?',
   w0),
  (s05,'00000000-0000-0000-0000-000000000002','REQ-004',
   'Hi {{first_name}}, saw you are heading up ML infra at {{company}}. We are scaling our feature store and your experience caught my attention. Happy to share more details if the timing is right.',
   w0);

-- -------------------------------------------------------
-- Sam Rivera (003) / REQ-002, REQ-005 — declining quality trend
-- -------------------------------------------------------
INSERT INTO outreach_samples (id, user_id, req_id, message_text, week_start_date) VALUES
  (s06,'00000000-0000-0000-0000-000000000003','REQ-002',
   'Hi {{first_name}}, your product management experience at {{company}} is impressive. We have a PM role that could be a great fit. Let me know if you would be open to a conversation.',
   w3),
  (s07,'00000000-0000-0000-0000-000000000003','REQ-002',
   'Hey, saw your profile. We are hiring for a PM role. Interested?',
   w2),
  (s08,'00000000-0000-0000-0000-000000000003','REQ-002',
   'Hi, we have a product role open. Let me know if you want to chat.',
   w1),
  (s09,'00000000-0000-0000-0000-000000000003','REQ-005',
   'Hi {{first_name}}, reaching out about a PM opportunity.',
   w0),
  (s10,'00000000-0000-0000-0000-000000000003','REQ-005',
   'We are hiring PMs. Are you open to new opportunities?',
   w0);

-- -------------------------------------------------------
-- Taylor Kim (004) / REQ-003 — stable quality
-- -------------------------------------------------------
INSERT INTO outreach_samples (id, user_id, req_id, message_text, week_start_date) VALUES
  (s11,'00000000-0000-0000-0000-000000000004','REQ-003',
   'Hi {{first_name}}, your experience leading design systems at {{company}} aligns well with our Principal Designer opening. We are rebuilding our design language from scratch — significant greenfield opportunity. Worth a quick chat?',
   w3),
  (s12,'00000000-0000-0000-0000-000000000004','REQ-003',
   'Hi {{first_name}}, I noticed your case study on redesigning the checkout flow at {{company}}. Our Principal Designer role has a very similar mandate — owning the end-to-end experience. Interested in learning more?',
   w2),
  (s13,'00000000-0000-0000-0000-000000000004','REQ-003',
   'Hi {{first_name}}, your work bridging design and engineering at {{company}} stood out. We are looking for a Principal Designer who can operate at that same interface. Would love to share more.',
   w1),
  (s14,'00000000-0000-0000-0000-000000000004','REQ-003',
   'Hi {{first_name}}, saw your talk on design tokens and scalable systems. Perfect timing — we are spinning up a new design platform and looking for a Principal to own it. Interested?',
   w0);

-- -------------------------------------------------------
-- Jordan Chen (005) / REQ-001, REQ-006 — rising quality
-- -------------------------------------------------------
INSERT INTO outreach_samples (id, user_id, req_id, message_text, week_start_date) VALUES
  (s15,'00000000-0000-0000-0000-000000000005','REQ-001',
   'Hi {{first_name}}, quick note on a Staff Eng role we are filling.',
   w3),
  (s16,'00000000-0000-0000-0000-000000000005','REQ-001',
   'Hi {{first_name}}, your background in platform engineering at {{company}} caught my attention. Our Staff Eng role owns the developer experience platform end-to-end. Strong comp and full remote. Worth a chat?',
   w2),
  (s17,'00000000-0000-0000-0000-000000000005','REQ-006',
   'Hi {{first_name}}, I have been following your work scaling the eng org at {{company}} from 20 to 200. We are at that same inflection point and looking for a Staff Eng to help us navigate it. Would love to connect.',
   w1),
  (s18,'00000000-0000-0000-0000-000000000005','REQ-006',
   'Hi {{first_name}}, your thought leadership on platform reliability is well-aligned with what we are building. The Staff Eng role I am recruiting for would put you at the center of our reliability strategy. Interested in a 20-min call?',
   w0);

-- -------------------------------------------------------
-- Casey Park (006) / REQ-007
-- -------------------------------------------------------
INSERT INTO outreach_samples (id, user_id, req_id, message_text, week_start_date) VALUES
  (s19,'00000000-0000-0000-0000-000000000006','REQ-007',
   'Hi {{first_name}}, noticed you recently shipped a major backend rewrite at {{company}}. We have a Senior Engineer role that is very similar in scope. Happy to share more details.',
   w2),
  (s20,'00000000-0000-0000-0000-000000000006','REQ-007',
   'Hi {{first_name}}, your engineering blog on observability tooling is exactly the domain we are investing in. Senior Eng role here if you are open to exploring.',
   w1),
  (s21,'00000000-0000-0000-0000-000000000006','REQ-007',
   'Hi {{first_name}}, your work on distributed tracing at {{company}} is directly relevant to our Senior Eng opening. The role comes with ownership of our observability stack. Interested?',
   w0);

-- -------------------------------------------------------
-- Riley Nguyen (007) / REQ-008
-- -------------------------------------------------------
INSERT INTO outreach_samples (id, user_id, req_id, message_text, week_start_date) VALUES
  (s22,'00000000-0000-0000-0000-000000000007','REQ-008',
   'Hi {{first_name}}, your background in growth engineering at {{company}} is a strong match for our Senior Growth Eng role. We are pre-IPO and the scope is broad. Worth a conversation?',
   w2),
  (s23,'00000000-0000-0000-0000-000000000007','REQ-008',
   'Hi {{first_name}}, saw you led growth experiments that moved the needle at {{company}}. Our Senior Growth Eng role has direct impact on our core acquisition funnel. Interested in learning more?',
   w1),
  (s24,'00000000-0000-0000-0000-000000000007','REQ-008',
   'Hi {{first_name}}, your work on referral loops and viral loops at {{company}} is exactly the muscle we need. This role owns the growth loop end-to-end with full A/B testing infra. Let me know if you are open.',
   w0);

-- -------------------------------------------------------
-- quality_reviews — provide historical trend data
-- Jamie: rising (2→3→4→5 over w3→w0)
-- Sam:   declining (5→4→3→2)
-- Taylor: stable (~3)
-- Jordan: rising (1→3→4→5)
-- Casey/Riley: stable
-- -------------------------------------------------------
INSERT INTO quality_reviews
  (outreach_sample_id, reviewer_id, personalization_score, relevance_score, clarity_score, cta_score)
VALUES
  -- Jamie rising
  (s01, reviewer, 2, 2, 2, 2),  -- w3 avg 2.0
  (s02, reviewer, 3, 3, 3, 3),  -- w2 avg 3.0
  (s03, reviewer, 4, 4, 4, 4),  -- w1 avg 4.0

  -- Sam declining
  (s06, reviewer, 5, 5, 5, 5),  -- w3 avg 5.0
  (s07, reviewer, 4, 4, 4, 3),  -- w2 avg 3.75
  (s08, reviewer, 3, 3, 2, 2),  -- w1 avg 2.5

  -- Taylor stable
  (s11, reviewer, 3, 3, 3, 3),  -- w3
  (s12, reviewer, 3, 4, 3, 3),  -- w2
  (s13, reviewer, 4, 3, 3, 3),  -- w1

  -- Jordan rising
  (s15, reviewer, 1, 1, 2, 1),  -- w3 avg 1.25
  (s16, reviewer, 3, 3, 3, 3),  -- w2 avg 3.0
  (s17, reviewer, 4, 4, 4, 4),  -- w1 avg 4.0

  -- Casey
  (s19, reviewer, 3, 3, 4, 3),  -- w2
  (s20, reviewer, 4, 3, 3, 3),  -- w1

  -- Riley
  (s22, reviewer, 4, 4, 4, 4),  -- w2
  (s23, reviewer, 5, 4, 4, 4);  -- w1

END $$;
