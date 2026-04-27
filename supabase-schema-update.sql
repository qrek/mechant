-- Ajouter les colonnes manquantes sur la table projects
-- Coller dans SQL Editor > New query sur app.supabase.com

ALTER TABLE projects ADD COLUMN IF NOT EXISTS poster text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_home text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_home_mobile text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS preview_video text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS year integer;
