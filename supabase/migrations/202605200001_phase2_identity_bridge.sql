-- Phase 2: Marketplace identity bridge + slug management
-- Links public.suppliers discovery records to auth.companies / seller_profiles
-- and adds slug history + redirect support for canonical URLs.

create table if not exists public.entity_slug_history (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('supplier', 'company', 'rfq', 'listing', 'product', 'service')),
  entity_id uuid not null,
  slug text not null,
  canonical_path text,
  replaced_at timestamptz not null default now(),
  unique (entity_type, slug)
);

create index if not exists entity_slug_history_entity_idx
  on public.entity_slug_history (entity_type, entity_id, replaced_at desc);

create table if not exists public.entity_slug_redirects (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('supplier', 'company', 'rfq', 'listing', 'product', 'service')),
  entity_id uuid not null,
  old_slug text not null,
  new_slug text not null,
  redirect_path text not null,
  created_at timestamptz not null default now(),
  unique (entity_type, old_slug)
);

create index if not exists entity_slug_redirects_new_slug_idx
  on public.entity_slug_redirects (entity_type, new_slug);

-- Identity bridge columns
alter table public.suppliers
  add column if not exists company_id uuid references public.companies(id) on delete set null,
  add column if not exists seller_profile_id uuid references public.seller_profiles(id) on delete set null;

alter table public.companies
  add column if not exists marketplace_supplier_id uuid references public.suppliers(id) on delete set null;

alter table public.rfqs
  add column if not exists buyer_profile_id uuid references public.buyer_profiles(id) on delete set null;

create index if not exists suppliers_company_id_idx on public.suppliers(company_id) where company_id is not null;
create index if not exists suppliers_seller_profile_id_idx on public.suppliers(seller_profile_id) where seller_profile_id is not null;
create index if not exists companies_marketplace_supplier_id_idx on public.companies(marketplace_supplier_id) where marketplace_supplier_id is not null;

-- RLS: slug tables are read-only for public; writes via service role / admin
alter table public.entity_slug_history enable row level security;
alter table public.entity_slug_redirects enable row level security;

drop policy if exists entity_slug_history_public_read on public.entity_slug_history;
create policy entity_slug_history_public_read on public.entity_slug_history
  for select using (true);

drop policy if exists entity_slug_redirects_public_read on public.entity_slug_redirects;
create policy entity_slug_redirects_public_read on public.entity_slug_redirects
  for select using (true);

grant select on public.entity_slug_history to anon, authenticated;
grant select on public.entity_slug_redirects to anon, authenticated;
