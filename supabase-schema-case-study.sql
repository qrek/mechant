-- ─────────────────────────────────────────────────────────────────────────────
-- AJOUT — page projet détaillée (case study)
-- Coller dans SQL Editor > New query sur app.supabase.com
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS has_case_study boolean DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS case_study_intro text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS case_study_body text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS extra_videos jsonb DEFAULT '[]'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_unique ON projects (slug) WHERE slug IS NOT NULL;
