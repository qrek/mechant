-- Ajouter les colonnes manquantes sur la table projects
-- Coller dans SQL Editor > New query sur app.supabase.com

ALTER TABLE projects ADD COLUMN IF NOT EXISTS poster text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_home text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_home_mobile text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS preview_video text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS year integer;

-- Bucket Supabase Storage pour les preview videos
-- Coller dans SQL Editor > New query sur app.supabase.com
INSERT INTO storage.buckets (id, name, public)
VALUES ('preview-videos', 'preview-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy : lecture publique
CREATE POLICY "Public read preview-videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'preview-videos');

-- Policy : upload authentifié
CREATE POLICY "Auth upload preview-videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'preview-videos' AND auth.role() = 'authenticated');

-- Policy : suppression authentifiée
CREATE POLICY "Auth delete preview-videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'preview-videos' AND auth.role() = 'authenticated');
