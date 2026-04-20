-- Tabel voor gedeelde rubrieken (community-bewerkte symptoom → middelen lijsten)
-- Plak dit in Supabase dashboard → SQL Editor → Run.
-- Idempotent: kan veilig opnieuw gedraaid worden.

create extension if not exists "pgcrypto";

create table if not exists public.shared_rubrics (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  remedy_string text not null,
  remedy_count  integer not null default 0,
  contributor   text not null default 'Anoniem',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Case-insensitive uniek op naam (zodat "Angst" en "angst" dezelfde rij delen).
-- De client rekent op errorcode 23505 bij duplicaten; dit levert die code.
create unique index if not exists shared_rubrics_name_lower_idx
  on public.shared_rubrics (lower(name));

-- Voor snelle zoekopdrachten op naam (ilike '%x%')
create index if not exists shared_rubrics_name_trgm_idx
  on public.shared_rubrics using gin (name gin_trgm_ops);

-- Trigram extensie nodig voor bovenstaande index
create extension if not exists pg_trgm;

-- updated_at automatisch bijwerken
create or replace function public.shared_rubrics_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists shared_rubrics_updated_at on public.shared_rubrics;
create trigger shared_rubrics_updated_at
  before update on public.shared_rubrics
  for each row execute function public.shared_rubrics_set_updated_at();

-- Row Level Security: aan zetten, daarna drie policies voor anon (publiek).
alter table public.shared_rubrics enable row level security;

drop policy if exists "shared_rubrics_select_anon" on public.shared_rubrics;
create policy "shared_rubrics_select_anon"
  on public.shared_rubrics for select
  to anon, authenticated
  using (true);

drop policy if exists "shared_rubrics_insert_anon" on public.shared_rubrics;
create policy "shared_rubrics_insert_anon"
  on public.shared_rubrics for insert
  to anon, authenticated
  with check (true);

drop policy if exists "shared_rubrics_update_anon" on public.shared_rubrics;
create policy "shared_rubrics_update_anon"
  on public.shared_rubrics for update
  to anon, authenticated
  using (true)
  with check (true);

-- Geen DELETE policy: rijen kunnen niet publiek verwijderd worden.
