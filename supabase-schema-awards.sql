-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE AWARDS / RÉCOMPENSES — section "Where it matters" de la page About
-- Coller et exécuter dans Supabase > SQL Editor > New query
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists awards (
  id uuid primary key default uuid_generate_v4(),
  year text not null,
  name text not null,
  tag text,
  order_index integer default 0,
  published boolean default true,
  created_at timestamptz default now()
);

alter table awards enable row level security;

-- Lecture publique (site)
create policy "Public read awards"
  on awards for select using (published = true);

-- Écriture authentifiée (admin)
create policy "Auth all awards"
  on awards for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────────
-- Données initiales (les récompenses actuelles, modifiables ensuite via l'admin)
-- ─────────────────────────────────────────────────────────────────────────────
insert into awards (year, name, tag, order_index) values
  ('2024', 'Cannes Lions',          'Shortlist', 4),
  ('2023', 'Ciclope Festival',      'Bronze',    3),
  ('2023', 'Young Directors Award', 'Selection', 2),
  ('2022', 'AICP Awards',           'Honor',     1)
on conflict do nothing;
