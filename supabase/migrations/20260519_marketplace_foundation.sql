-- MetalHub marketplace foundation
-- Purpose: normalized supplier discovery, RFQ taxonomy, certification trust, RBAC helpers,
-- ranking governance, seeded liquidity tracking, and server-side search readiness.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create schema if not exists public;

do $$
begin
  create type public.app_role as enum ('buyer', 'seller', 'admin', 'superadmin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.verification_status as enum (
    'unverified',
    'pending',
    'verified',
    'rejected',
    'suspended'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.certification_lifecycle_status as enum (
    'active',
    'pending_verification',
    'under_review',
    'expired',
    'suspended',
    'revoked',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.marketplace_settings_status as enum (
    'draft',
    'scheduled',
    'active',
    'expired',
    'rolled_back',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.rfq_status as enum (
    'draft',
    'open',
    'in_review',
    'awarded',
    'closed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.app_role not null default 'buyer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists role public.app_role not null default 'buyer',
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    auth.jwt() ->> 'role',
    (
      select p.role::text
      from public.profiles p
      where p.id = auth.uid()
      limit 1
    ),
    'buyer'
  );
$$;

create or replace function public.is_admin_role()
returns boolean
language sql
stable
as $$
  select public.current_user_role() in ('admin', 'superadmin');
$$;

create or replace function public.is_superadmin_role()
returns boolean
language sql
stable
as $$
  select public.current_user_role() = 'superadmin';
$$;

create table if not exists public.industries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.capabilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  product_family text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text,
  description text,
  global_recognition_level integer not null default 50 check (global_recognition_level between 0 and 100),
  business_priority integer not null default 50 check (business_priority between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  company_name text not null,
  slug text not null unique,
  short_description text not null,
  full_description text,
  logo_url text,
  banner_url text,
  website text,
  established_year integer check (established_year between 1800 and extract(year from now())::integer),
  employee_count integer check (employee_count >= 0),
  gst_like_identifier text,
  city text not null,
  state text not null,
  country text not null default 'India',
  verification_status public.verification_status not null default 'unverified',
  response_rate numeric(5,2) not null default 0 check (response_rate between 0 and 100),
  completion_rate numeric(5,2) not null default 0 check (completion_rate between 0 and 100),
  years_in_business integer not null default 0 check (years_in_business >= 0),
  avg_response_time text,
  export_capability boolean not null default false,
  domestic_capability boolean not null default true,
  featured_product text,
  featured_material text,
  moq text,
  production_capacity text,
  price_range text,
  recent_activity text,
  activity_score numeric(10,4) not null default 0,
  profile_completeness numeric(5,2) not null default 0 check (profile_completeness between 0 and 100),
  interaction_count integer not null default 0 check (interaction_count >= 0),
  real_interaction_count integer not null default 0 check (real_interaction_count >= 0),
  static_rank_score numeric(12,4) not null default 0,
  dynamic_rank_score numeric(12,4) not null default 0,
  supplier_rank_score numeric(12,4) not null default 0,
  search_rank_cache numeric(12,4) not null default 0,
  search_document tsvector,
  is_seeded boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rfqs (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid references auth.users(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text not null,
  buyer_company_name text,
  city text,
  state text,
  country text not null default 'India',
  quantity text,
  budget_range text,
  required_by date,
  status public.rfq_status not null default 'open',
  verification_status public.verification_status not null default 'unverified',
  is_seeded boolean not null default false,
  created_by_real_user boolean not null default false,
  activity_score numeric(10,4) not null default 0,
  interaction_count integer not null default 0 check (interaction_count >= 0),
  static_rank_score numeric(12,4) not null default 0,
  dynamic_rank_score numeric(12,4) not null default 0,
  rfq_rank_score numeric(12,4) not null default 0,
  search_document tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_industries (
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  industry_id uuid not null references public.industries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (supplier_id, industry_id)
);

create table if not exists public.supplier_capabilities (
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  capability_id uuid not null references public.capabilities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (supplier_id, capability_id)
);

create table if not exists public.supplier_products (
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (supplier_id, product_id)
);

create table if not exists public.supplier_certifications (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  certification_id uuid not null references public.certifications(id) on delete restrict,
  certificate_number text,
  issued_by text,
  issued_at date,
  expires_at date,
  verification_status public.certification_lifecycle_status not null default 'pending_verification',
  document_url text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  rejection_reason text,
  revoked_reason text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supplier_id, certification_id, certificate_number)
);

create table if not exists public.rfq_industries (
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  industry_id uuid not null references public.industries(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (rfq_id, industry_id)
);

create table if not exists public.rfq_capabilities (
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  capability_id uuid not null references public.capabilities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (rfq_id, capability_id)
);

create table if not exists public.rfq_products (
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (rfq_id, product_id)
);

create table if not exists public.supplier_activity (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  activity_type text not null,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  activity_score numeric(10,4) not null default 0,
  is_seeded boolean not null default false,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.rfq_activity (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  activity_type text not null,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  activity_score numeric(10,4) not null default 0,
  is_seeded boolean not null default false,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  description text,
  is_public boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_settings_versions (
  id uuid primary key default gen_random_uuid(),
  version_name text not null,
  status public.marketplace_settings_status not null default 'draft',
  is_active boolean not null default false,
  is_scheduled boolean not null default false,
  activation_start_at timestamptz,
  activation_end_at timestamptz,
  activated_by uuid references auth.users(id) on delete set null,
  activated_at timestamptz,
  rollback_version_id uuid references public.marketplace_settings_versions(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  notes text,

  seeded_supplier_weight numeric(8,4) not null default 0.7000,
  seeded_rfq_weight numeric(8,4) not null default 0.7000,
  real_supplier_boost numeric(8,4) not null default 1.5000,
  real_rfq_boost numeric(8,4) not null default 1.5000,
  exact_phrase_boost numeric(8,4) not null default 15.0000,
  capability_weight numeric(8,4) not null default 10.0000,
  product_weight numeric(8,4) not null default 9.0000,
  certification_weight numeric(8,4) not null default 6.0000,
  verification_weight numeric(8,4) not null default 5.0000,
  activity_weight numeric(8,4) not null default 4.0000,
  profile_completeness_weight numeric(8,4) not null default 3.0000,
  interaction_weight numeric(8,4) not null default 3.0000,
  location_weight numeric(8,4) not null default 2.0000,
  supplier_name_weight numeric(8,4) not null default 1.5000,
  seed_decay_threshold integer not null default 100,
  seed_visibility_decay_rate numeric(8,4) not null default 0.0150,
  minimum_real_threshold integer not null default 25,
  maximum_seed_visibility numeric(5,2) not null default 100 check (maximum_seed_visibility between 0 and 100),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint marketplace_settings_activation_window_valid
    check (activation_end_at is null or activation_start_at is null or activation_end_at > activation_start_at)
);

create unique index if not exists marketplace_settings_one_active_idx
  on public.marketplace_settings_versions (is_active)
  where is_active = true;

create unique index if not exists marketplace_settings_one_active_status_idx
  on public.marketplace_settings_versions (status)
  where status = 'active';

create table if not exists public.marketplace_ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  settings_version_id uuid references public.marketplace_settings_versions(id) on delete set null,
  snapshot_data_json jsonb not null,
  supplier_count integer not null default 0,
  rfq_count integer not null default 0,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.get_active_marketplace_settings()
returns public.marketplace_settings_versions
language sql
stable
security definer
set search_path = public
as $$
  select m.*
  from public.marketplace_settings_versions m
  where m.status = 'active'
    and m.is_active = true
    and (m.activation_start_at is null or now() >= m.activation_start_at)
    and (m.activation_end_at is null or now() <= m.activation_end_at)
  order by m.activated_at desc nulls last, m.created_at desc
  limit 1;
$$;

create or replace function public.refresh_supplier_search_document(target_supplier_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.suppliers s
  set search_document =
    setweight(to_tsvector('english', coalesce(s.featured_product, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(s.short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(s.full_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(s.city, '') || ' ' || coalesce(s.state, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(s.company_name, '')), 'D') ||
    setweight(to_tsvector('english', coalesce((
      select string_agg(c.name, ' ')
      from public.supplier_capabilities sc
      join public.capabilities c on c.id = sc.capability_id
      where sc.supplier_id = s.id
    ), '')), 'A') ||
    setweight(to_tsvector('english', coalesce((
      select string_agg(p.name, ' ')
      from public.supplier_products sp
      join public.products p on p.id = sp.product_id
      where sp.supplier_id = s.id
    ), '')), 'A') ||
    setweight(to_tsvector('english', coalesce((
      select string_agg(i.name, ' ')
      from public.supplier_industries si
      join public.industries i on i.id = si.industry_id
      where si.supplier_id = s.id
    ), '')), 'C') ||
    setweight(to_tsvector('english', coalesce((
      select string_agg(cert.name, ' ')
      from public.supplier_certifications scert
      join public.certifications cert on cert.id = scert.certification_id
      where scert.supplier_id = s.id
        and scert.verification_status = 'active'
        and (scert.expires_at is null or scert.expires_at >= current_date)
    ), '')), 'C')
  where s.id = target_supplier_id;
end;
$$;

create or replace function public.refresh_rfq_search_document(target_rfq_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.rfqs r
  set search_document =
    setweight(to_tsvector('english', coalesce(r.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(r.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(r.city, '') || ' ' || coalesce(r.state, '')), 'D') ||
    setweight(to_tsvector('english', coalesce((
      select string_agg(c.name, ' ')
      from public.rfq_capabilities rc
      join public.capabilities c on c.id = rc.capability_id
      where rc.rfq_id = r.id
    ), '')), 'A') ||
    setweight(to_tsvector('english', coalesce((
      select string_agg(p.name, ' ')
      from public.rfq_products rp
      join public.products p on p.id = rp.product_id
      where rp.rfq_id = r.id
    ), '')), 'A') ||
    setweight(to_tsvector('english', coalesce((
      select string_agg(i.name, ' ')
      from public.rfq_industries ri
      join public.industries i on i.id = ri.industry_id
      where ri.rfq_id = r.id
    ), '')), 'C')
  where r.id = target_rfq_id;
end;
$$;

create or replace function public.touch_supplier_search_document()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_supplier_id uuid;
begin
  target_supplier_id := coalesce(new.supplier_id, old.supplier_id);
  perform public.refresh_supplier_search_document(target_supplier_id);
  return coalesce(new, old);
end;
$$;

create or replace function public.touch_rfq_search_document()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_rfq_id uuid;
begin
  target_rfq_id := coalesce(new.rfq_id, old.rfq_id);
  perform public.refresh_rfq_search_document(target_rfq_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists suppliers_set_updated_at on public.suppliers;
create trigger suppliers_set_updated_at
before update on public.suppliers
for each row execute function public.set_updated_at();

drop trigger if exists rfqs_set_updated_at on public.rfqs;
create trigger rfqs_set_updated_at
before update on public.rfqs
for each row execute function public.set_updated_at();

drop trigger if exists supplier_certifications_set_updated_at on public.supplier_certifications;
create trigger supplier_certifications_set_updated_at
before update on public.supplier_certifications
for each row execute function public.set_updated_at();

drop trigger if exists platform_settings_set_updated_at on public.platform_settings;
create trigger platform_settings_set_updated_at
before update on public.platform_settings
for each row execute function public.set_updated_at();

drop trigger if exists marketplace_settings_versions_set_updated_at on public.marketplace_settings_versions;
create trigger marketplace_settings_versions_set_updated_at
before update on public.marketplace_settings_versions
for each row execute function public.set_updated_at();

drop trigger if exists supplier_capabilities_refresh_search on public.supplier_capabilities;
create trigger supplier_capabilities_refresh_search
after insert or update or delete on public.supplier_capabilities
for each row execute function public.touch_supplier_search_document();

drop trigger if exists supplier_products_refresh_search on public.supplier_products;
create trigger supplier_products_refresh_search
after insert or update or delete on public.supplier_products
for each row execute function public.touch_supplier_search_document();

drop trigger if exists supplier_industries_refresh_search on public.supplier_industries;
create trigger supplier_industries_refresh_search
after insert or update or delete on public.supplier_industries
for each row execute function public.touch_supplier_search_document();

drop trigger if exists supplier_certifications_refresh_search on public.supplier_certifications;
create trigger supplier_certifications_refresh_search
after insert or update or delete on public.supplier_certifications
for each row execute function public.touch_supplier_search_document();

drop trigger if exists rfq_capabilities_refresh_search on public.rfq_capabilities;
create trigger rfq_capabilities_refresh_search
after insert or update or delete on public.rfq_capabilities
for each row execute function public.touch_rfq_search_document();

drop trigger if exists rfq_products_refresh_search on public.rfq_products;
create trigger rfq_products_refresh_search
after insert or update or delete on public.rfq_products
for each row execute function public.touch_rfq_search_document();

drop trigger if exists rfq_industries_refresh_search on public.rfq_industries;
create trigger rfq_industries_refresh_search
after insert or update or delete on public.rfq_industries
for each row execute function public.touch_rfq_search_document();

create index if not exists industries_slug_idx on public.industries (slug);
create index if not exists industries_active_idx on public.industries (is_active);

create index if not exists capabilities_slug_idx on public.capabilities (slug);
create index if not exists capabilities_active_idx on public.capabilities (is_active);

create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_active_idx on public.products (is_active);

create index if not exists certifications_slug_idx on public.certifications (slug);
create index if not exists certifications_active_idx on public.certifications (is_active);
create index if not exists certifications_priority_idx on public.certifications (business_priority desc, global_recognition_level desc);

create index if not exists suppliers_slug_idx on public.suppliers (slug);
create index if not exists suppliers_city_idx on public.suppliers (city);
create index if not exists suppliers_state_idx on public.suppliers (state);
create index if not exists suppliers_verification_idx on public.suppliers (verification_status);
create index if not exists suppliers_seeded_idx on public.suppliers (is_seeded);
create index if not exists suppliers_created_at_idx on public.suppliers (created_at desc);
create index if not exists suppliers_rank_idx on public.suppliers (supplier_rank_score desc, created_at desc);
create index if not exists suppliers_search_document_idx on public.suppliers using gin (search_document);
create index if not exists suppliers_company_trgm_idx on public.suppliers using gin (company_name gin_trgm_ops);
create index if not exists suppliers_featured_product_trgm_idx on public.suppliers using gin (featured_product gin_trgm_ops);

create index if not exists rfqs_slug_idx on public.rfqs (slug);
create index if not exists rfqs_status_idx on public.rfqs (status);
create index if not exists rfqs_seeded_idx on public.rfqs (is_seeded);
create index if not exists rfqs_created_at_idx on public.rfqs (created_at desc);
create index if not exists rfqs_rank_idx on public.rfqs (rfq_rank_score desc, created_at desc);
create index if not exists rfqs_search_document_idx on public.rfqs using gin (search_document);
create index if not exists rfqs_title_trgm_idx on public.rfqs using gin (title gin_trgm_ops);

create index if not exists supplier_industries_industry_idx on public.supplier_industries (industry_id);
create index if not exists supplier_capabilities_capability_idx on public.supplier_capabilities (capability_id);
create index if not exists supplier_products_product_idx on public.supplier_products (product_id);
create index if not exists supplier_certifications_supplier_idx on public.supplier_certifications (supplier_id);
create index if not exists supplier_certifications_certification_idx on public.supplier_certifications (certification_id);
create index if not exists supplier_certifications_status_idx on public.supplier_certifications (verification_status);
create index if not exists supplier_certifications_expires_idx on public.supplier_certifications (expires_at);

create index if not exists rfq_industries_industry_idx on public.rfq_industries (industry_id);
create index if not exists rfq_capabilities_capability_idx on public.rfq_capabilities (capability_id);
create index if not exists rfq_products_product_idx on public.rfq_products (product_id);

create index if not exists supplier_activity_supplier_idx on public.supplier_activity (supplier_id, occurred_at desc);
create index if not exists supplier_activity_seeded_idx on public.supplier_activity (is_seeded);
create index if not exists rfq_activity_rfq_idx on public.rfq_activity (rfq_id, occurred_at desc);
create index if not exists rfq_activity_seeded_idx on public.rfq_activity (is_seeded);

create index if not exists platform_settings_public_idx on public.platform_settings (is_public);
create index if not exists marketplace_settings_status_idx on public.marketplace_settings_versions (status);
create index if not exists marketplace_settings_schedule_idx
  on public.marketplace_settings_versions (activation_start_at, activation_end_at)
  where is_scheduled = true;

alter table public.profiles enable row level security;
alter table public.industries enable row level security;
alter table public.capabilities enable row level security;
alter table public.products enable row level security;
alter table public.certifications enable row level security;
alter table public.suppliers enable row level security;
alter table public.rfqs enable row level security;
alter table public.supplier_industries enable row level security;
alter table public.supplier_capabilities enable row level security;
alter table public.supplier_products enable row level security;
alter table public.supplier_certifications enable row level security;
alter table public.rfq_industries enable row level security;
alter table public.rfq_capabilities enable row level security;
alter table public.rfq_products enable row level security;
alter table public.supplier_activity enable row level security;
alter table public.rfq_activity enable row level security;
alter table public.platform_settings enable row level security;
alter table public.marketplace_settings_versions enable row level security;
alter table public.marketplace_ranking_snapshots enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select"
on public.profiles for select
using (id = auth.uid() or public.is_admin_role());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
on public.profiles for update
using (id = auth.uid() or public.is_superadmin_role())
with check (
  public.is_superadmin_role()
  or (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()))
);

drop policy if exists "taxonomy_public_read_industries" on public.industries;
create policy "taxonomy_public_read_industries"
on public.industries for select
using (is_active = true or public.is_admin_role());

drop policy if exists "taxonomy_admin_write_industries" on public.industries;
create policy "taxonomy_admin_write_industries"
on public.industries for all
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "taxonomy_public_read_capabilities" on public.capabilities;
create policy "taxonomy_public_read_capabilities"
on public.capabilities for select
using (is_active = true or public.is_admin_role());

drop policy if exists "taxonomy_admin_write_capabilities" on public.capabilities;
create policy "taxonomy_admin_write_capabilities"
on public.capabilities for all
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "taxonomy_public_read_products" on public.products;
create policy "taxonomy_public_read_products"
on public.products for select
using (is_active = true or public.is_admin_role());

drop policy if exists "taxonomy_admin_write_products" on public.products;
create policy "taxonomy_admin_write_products"
on public.products for all
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "certifications_public_read" on public.certifications;
create policy "certifications_public_read"
on public.certifications for select
using (is_active = true or public.is_admin_role());

drop policy if exists "certifications_admin_write" on public.certifications;
create policy "certifications_admin_write"
on public.certifications for all
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "suppliers_public_discovery" on public.suppliers;
create policy "suppliers_public_discovery"
on public.suppliers for select
using (
  is_published = true
  or owner_user_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "suppliers_owner_insert" on public.suppliers;
create policy "suppliers_owner_insert"
on public.suppliers for insert
with check (
  public.is_admin_role()
  or owner_user_id = auth.uid()
);

drop policy if exists "suppliers_owner_update" on public.suppliers;
create policy "suppliers_owner_update"
on public.suppliers for update
using (
  public.is_admin_role()
  or owner_user_id = auth.uid()
)
with check (
  public.is_admin_role()
  or owner_user_id = auth.uid()
);

drop policy if exists "suppliers_admin_delete" on public.suppliers;
create policy "suppliers_admin_delete"
on public.suppliers for delete
using (public.is_superadmin_role());

drop policy if exists "rfqs_visible" on public.rfqs;
create policy "rfqs_visible"
on public.rfqs for select
using (
  status in ('open', 'in_review', 'awarded', 'closed')
  or buyer_user_id = auth.uid()
  or public.is_admin_role()
);

drop policy if exists "rfqs_buyer_insert" on public.rfqs;
create policy "rfqs_buyer_insert"
on public.rfqs for insert
with check (
  public.is_admin_role()
  or buyer_user_id = auth.uid()
);

drop policy if exists "rfqs_buyer_update" on public.rfqs;
create policy "rfqs_buyer_update"
on public.rfqs for update
using (
  public.is_admin_role()
  or buyer_user_id = auth.uid()
)
with check (
  public.is_admin_role()
  or buyer_user_id = auth.uid()
);

drop policy if exists "supplier_relations_public_read_industries" on public.supplier_industries;
create policy "supplier_relations_public_read_industries"
on public.supplier_industries for select
using (
  exists (
    select 1 from public.suppliers s
    where s.id = supplier_id and (s.is_published = true or s.owner_user_id = auth.uid() or public.is_admin_role())
  )
);

drop policy if exists "supplier_relations_admin_write_industries" on public.supplier_industries;
create policy "supplier_relations_admin_write_industries"
on public.supplier_industries for all
using (
  public.is_admin_role()
  or exists (select 1 from public.suppliers s where s.id = supplier_id and s.owner_user_id = auth.uid())
)
with check (
  public.is_admin_role()
  or exists (select 1 from public.suppliers s where s.id = supplier_id and s.owner_user_id = auth.uid())
);

drop policy if exists "supplier_relations_public_read_capabilities" on public.supplier_capabilities;
create policy "supplier_relations_public_read_capabilities"
on public.supplier_capabilities for select
using (
  exists (
    select 1 from public.suppliers s
    where s.id = supplier_id and (s.is_published = true or s.owner_user_id = auth.uid() or public.is_admin_role())
  )
);

drop policy if exists "supplier_relations_admin_write_capabilities" on public.supplier_capabilities;
create policy "supplier_relations_admin_write_capabilities"
on public.supplier_capabilities for all
using (
  public.is_admin_role()
  or exists (select 1 from public.suppliers s where s.id = supplier_id and s.owner_user_id = auth.uid())
)
with check (
  public.is_admin_role()
  or exists (select 1 from public.suppliers s where s.id = supplier_id and s.owner_user_id = auth.uid())
);

drop policy if exists "supplier_relations_public_read_products" on public.supplier_products;
create policy "supplier_relations_public_read_products"
on public.supplier_products for select
using (
  exists (
    select 1 from public.suppliers s
    where s.id = supplier_id and (s.is_published = true or s.owner_user_id = auth.uid() or public.is_admin_role())
  )
);

drop policy if exists "supplier_relations_admin_write_products" on public.supplier_products;
create policy "supplier_relations_admin_write_products"
on public.supplier_products for all
using (
  public.is_admin_role()
  or exists (select 1 from public.suppliers s where s.id = supplier_id and s.owner_user_id = auth.uid())
)
with check (
  public.is_admin_role()
  or exists (select 1 from public.suppliers s where s.id = supplier_id and s.owner_user_id = auth.uid())
);

drop policy if exists "supplier_certifications_read" on public.supplier_certifications;
create policy "supplier_certifications_read"
on public.supplier_certifications for select
using (
  verification_status in ('active', 'pending_verification', 'under_review', 'expired', 'revoked')
  or public.is_admin_role()
  or exists (select 1 from public.suppliers s where s.id = supplier_id and s.owner_user_id = auth.uid())
);

drop policy if exists "supplier_certifications_write" on public.supplier_certifications;
create policy "supplier_certifications_write"
on public.supplier_certifications for all
using (
  public.is_admin_role()
  or exists (select 1 from public.suppliers s where s.id = supplier_id and s.owner_user_id = auth.uid())
)
with check (
  public.is_admin_role()
  or exists (select 1 from public.suppliers s where s.id = supplier_id and s.owner_user_id = auth.uid())
);

drop policy if exists "rfq_relations_read_industries" on public.rfq_industries;
create policy "rfq_relations_read_industries"
on public.rfq_industries for select
using (exists (select 1 from public.rfqs r where r.id = rfq_id and (r.status <> 'draft' or r.buyer_user_id = auth.uid() or public.is_admin_role())));

drop policy if exists "rfq_relations_write_industries" on public.rfq_industries;
create policy "rfq_relations_write_industries"
on public.rfq_industries for all
using (public.is_admin_role() or exists (select 1 from public.rfqs r where r.id = rfq_id and r.buyer_user_id = auth.uid()))
with check (public.is_admin_role() or exists (select 1 from public.rfqs r where r.id = rfq_id and r.buyer_user_id = auth.uid()));

drop policy if exists "rfq_relations_read_capabilities" on public.rfq_capabilities;
create policy "rfq_relations_read_capabilities"
on public.rfq_capabilities for select
using (exists (select 1 from public.rfqs r where r.id = rfq_id and (r.status <> 'draft' or r.buyer_user_id = auth.uid() or public.is_admin_role())));

drop policy if exists "rfq_relations_write_capabilities" on public.rfq_capabilities;
create policy "rfq_relations_write_capabilities"
on public.rfq_capabilities for all
using (public.is_admin_role() or exists (select 1 from public.rfqs r where r.id = rfq_id and r.buyer_user_id = auth.uid()))
with check (public.is_admin_role() or exists (select 1 from public.rfqs r where r.id = rfq_id and r.buyer_user_id = auth.uid()));

drop policy if exists "rfq_relations_read_products" on public.rfq_products;
create policy "rfq_relations_read_products"
on public.rfq_products for select
using (exists (select 1 from public.rfqs r where r.id = rfq_id and (r.status <> 'draft' or r.buyer_user_id = auth.uid() or public.is_admin_role())));

drop policy if exists "rfq_relations_write_products" on public.rfq_products;
create policy "rfq_relations_write_products"
on public.rfq_products for all
using (public.is_admin_role() or exists (select 1 from public.rfqs r where r.id = rfq_id and r.buyer_user_id = auth.uid()))
with check (public.is_admin_role() or exists (select 1 from public.rfqs r where r.id = rfq_id and r.buyer_user_id = auth.uid()));

drop policy if exists "supplier_activity_read" on public.supplier_activity;
create policy "supplier_activity_read"
on public.supplier_activity for select
using (
  exists (
    select 1 from public.suppliers s
    where s.id = supplier_id and (s.is_published = true or s.owner_user_id = auth.uid() or public.is_admin_role())
  )
);

drop policy if exists "supplier_activity_admin_write" on public.supplier_activity;
create policy "supplier_activity_admin_write"
on public.supplier_activity for all
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "rfq_activity_read" on public.rfq_activity;
create policy "rfq_activity_read"
on public.rfq_activity for select
using (
  exists (
    select 1 from public.rfqs r
    where r.id = rfq_id and (r.status <> 'draft' or r.buyer_user_id = auth.uid() or public.is_admin_role())
  )
);

drop policy if exists "rfq_activity_admin_write" on public.rfq_activity;
create policy "rfq_activity_admin_write"
on public.rfq_activity for all
using (public.is_admin_role())
with check (public.is_admin_role());

drop policy if exists "platform_settings_public_read" on public.platform_settings;
create policy "platform_settings_public_read"
on public.platform_settings for select
using (is_public = true or public.is_admin_role());

drop policy if exists "platform_settings_superadmin_write" on public.platform_settings;
create policy "platform_settings_superadmin_write"
on public.platform_settings for all
using (public.is_superadmin_role())
with check (public.is_superadmin_role());

drop policy if exists "marketplace_settings_admin_read" on public.marketplace_settings_versions;
create policy "marketplace_settings_admin_read"
on public.marketplace_settings_versions for select
using (public.is_admin_role());

drop policy if exists "marketplace_settings_superadmin_write" on public.marketplace_settings_versions;
create policy "marketplace_settings_superadmin_write"
on public.marketplace_settings_versions for all
using (public.is_superadmin_role())
with check (public.is_superadmin_role());

drop policy if exists "ranking_snapshots_admin_read" on public.marketplace_ranking_snapshots;
create policy "ranking_snapshots_admin_read"
on public.marketplace_ranking_snapshots for select
using (public.is_admin_role());

drop policy if exists "ranking_snapshots_admin_write" on public.marketplace_ranking_snapshots;
create policy "ranking_snapshots_admin_write"
on public.marketplace_ranking_snapshots for insert
with check (public.is_admin_role());

insert into public.marketplace_settings_versions (
  version_name,
  status,
  is_active,
  activated_at,
  notes
)
select
  'Default Marketplace Ranking v1',
  'active',
  true,
  now(),
  'Initial MetalHub weighted discovery configuration.'
where not exists (
  select 1 from public.marketplace_settings_versions where is_active = true
);

insert into public.platform_settings (key, value, description, is_public)
values
  ('signup_enabled', 'true'::jsonb, 'Controls whether public signup is enabled.', true),
  ('default_user_role', '"buyer"'::jsonb, 'Default role assigned after signup.', false),
  ('marketplace_seeded_liquidity_enabled', 'true'::jsonb, 'Allows seeded marketplace data to support early liquidity.', false)
on conflict (key) do nothing;

grant usage on schema public to anon, authenticated;
grant select on public.industries, public.capabilities, public.products, public.certifications to anon, authenticated;
grant select on public.suppliers, public.supplier_industries, public.supplier_capabilities, public.supplier_products, public.supplier_certifications to anon, authenticated;
grant select on public.rfqs, public.rfq_industries, public.rfq_capabilities, public.rfq_products to anon, authenticated;
grant select on public.supplier_activity, public.rfq_activity to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.is_admin_role() to anon, authenticated;
grant execute on function public.is_superadmin_role() to anon, authenticated;
grant execute on function public.get_active_marketplace_settings() to authenticated;