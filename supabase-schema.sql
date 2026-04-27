-- ─────────────────────────────────────────────────────────────────────────────
-- SCHÉMA SUPABASE — Méchant.TV
-- Coller et exécuter dans SQL Editor > New query sur app.supabase.com
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- CATÉGORIES
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- PROJETS
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  client text,
  vimeo_id text not null,
  thumbnail_url text,
  description text,
  categories uuid[] default '{}',
  badges text[] default '{}',
  is_hero boolean default false,
  hero_title text,
  hero_order integer default 0,
  order_index integer default 0,
  published boolean default true,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table categories enable row level security;
alter table projects enable row level security;

-- Lecture publique (site)
create policy "Public read categories"
  on categories for select using (true);

create policy "Public read projects"
  on projects for select using (published = true);

-- Écriture authentifiée (admin)
create policy "Auth all categories"
  on categories for all using (auth.role() = 'authenticated');

create policy "Auth all projects"
  on projects for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────────
-- Données initiales — catégories (adapter selon vos catégories réelles)
-- ─────────────────────────────────────────────────────────────────────────────

insert into categories (title, slug, order_index) values
  ('Visual Effects', 'visual-effects', 1),
  ('Color Grading', 'color-grading', 2),
  ('Motion Design', 'motion-design', 3),
  ('Sound Design', 'sound-design', 4)
on conflict (slug) do nothing;
