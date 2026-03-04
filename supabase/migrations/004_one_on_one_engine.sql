-- ============================================================
-- OneOnOne Engine Migration
-- Tables: one_on_ones, action_items
-- ============================================================

-- Table: one_on_ones
CREATE TABLE IF NOT EXISTS public.one_on_ones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  report_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ,
  summary       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_one_on_ones_manager_id
  ON public.one_on_ones (manager_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_one_on_ones_report_id
  ON public.one_on_ones (report_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_one_on_ones_completed_at
  ON public.one_on_ones (completed_at) WHERE completed_at IS NOT NULL;

ALTER TABLE public.one_on_ones ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (consistent with other tables)
CREATE POLICY "one_on_ones_select" ON public.one_on_ones
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "one_on_ones_insert" ON public.one_on_ones
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "one_on_ones_update" ON public.one_on_ones
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "one_on_ones_delete" ON public.one_on_ones
  FOR DELETE TO authenticated USING (true);

-- ============================================================

-- Table: action_items
-- one_on_one_id is nullable — items survive 1:1 deletion (SET NULL)
CREATE TABLE IF NOT EXISTS public.action_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  one_on_one_id  UUID REFERENCES public.one_on_ones(id) ON DELETE SET NULL,
  owner_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description    TEXT NOT NULL,
  due_date       DATE NOT NULL,
  status         TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_items_owner_open
  ON public.action_items (owner_id, status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_action_items_due_date
  ON public.action_items (due_date) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_action_items_one_on_one_id
  ON public.action_items (one_on_one_id) WHERE one_on_one_id IS NOT NULL;

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "action_items_select" ON public.action_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "action_items_insert" ON public.action_items
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "action_items_update" ON public.action_items
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "action_items_delete" ON public.action_items
  FOR DELETE TO authenticated USING (true);
