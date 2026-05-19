-- MetalHub development trust foundation
-- Additive, backward-compatible schema for marketplace trust, taxonomy,
-- locations, media, profile completion, auditability, and email logs.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$
begin
  create type public.mh_user_role as enum ('buyer', 'seller', 'both', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter type public.mh_user_role add value if not exists 'supplier_success';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.mh_profile_status as enum ('incomplete', 'in_progress', 'complete');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.mh_verification_status as enum ('draft', 'pending', 'in_review', 'approved', 'rejected', 'expired');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.mh_taxonomy_type as enum ('industry', 'category', 'subcategory', 'process', 'material', 'capability');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.mh_media_type as enum ('image', 'pdf', 'cad', 'video', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.mh_onboarding_session_status as enum ('active', 'completed', 'abandoned', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.mh_rfq_status as enum ('draft', 'open', 'in_review', 'quoted', 'closed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.mh_quote_status as enum ('draft', 'submitted', 'viewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn', 'expired');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.mh_message_thread_status as enum ('open', 'archived', 'closed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.platform_settings
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

insert into public.platform_settings (key, value, description)
values
  ('development_trust_mode', 'true'::jsonb, 'Bypasses hard trust blocks while still collecting trust signals.'),
  ('trust_signal_weights', '{"identity":15,"business":25,"profile_quality":15,"behavior":25,"marketplace_performance":20}'::jsonb, 'Weighted inputs for the hybrid supplier trust engine.')
on conflict (key) do update
set value = excluded.value,
    description = excluded.description,
    updated_at = now();

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role public.mh_user_role not null default 'buyer',
  profile_status public.mh_profile_status not null default 'incomplete',
  trust_level integer not null default 0,
  onboarding_step integer not null default 1,
  verification_status public.mh_verification_status not null default 'pending',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table if exists public.profiles
  add column if not exists phone text,
  add column if not exists role public.mh_user_role not null default 'buyer',
  add column if not exists profile_status public.mh_profile_status not null default 'incomplete',
  add column if not exists trust_level integer not null default 0,
  add column if not exists onboarding_step integer not null default 1,
  add column if not exists verification_status public.mh_verification_status not null default 'pending',
  add column if not exists avatar_url text,
  add column if not exists deleted_at timestamptz;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.mh_user_role;
begin
  requested_role := case
    when new.raw_user_meta_data->>'role' in ('buyer', 'seller', 'both', 'admin', 'supplier_success')
      then (new.raw_user_meta_data->>'role')::public.mh_user_role
    else 'buyer'::public.mh_user_role
  end;

  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    profile_status,
    trust_level,
    onboarding_step,
    verification_status,
    avatar_url
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.phone, new.raw_user_meta_data->>'phone'),
    requested_role,
    'incomplete',
    0,
    1,
    case when new.email_confirmed_at is not null then 'pending' else 'draft' end,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email),
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      phone = coalesce(public.profiles.phone, excluded.phone),
      avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- Backfill auth users into profiles.
-- Remote DBs may already use profiles.role = app_role (marketplace foundation) or mh_user_role (legacy).
do $$
declare
  profile_role_udt text;
begin
  select c.udt_name
  into profile_role_udt
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'profiles'
    and c.column_name = 'role';

  if profile_role_udt = 'app_role' then
    insert into public.profiles (
      id,
      email,
      full_name,
      phone,
      role,
      profile_status,
      trust_level,
      onboarding_step,
      verification_status,
      avatar_url
    )
    select
      users.id,
      users.email,
      coalesce(users.raw_user_meta_data->>'full_name', users.raw_user_meta_data->>'name'),
      coalesce(users.phone, users.raw_user_meta_data->>'phone'),
      case
        when users.raw_user_meta_data->>'role' in ('super_admin', 'superadmin')
          then 'superadmin'::public.app_role
        when users.raw_user_meta_data->>'role' in ('admin')
          then 'admin'::public.app_role
        when users.raw_user_meta_data->>'role' in ('seller', 'both', 'manufacturer', 'distributor')
          then 'seller'::public.app_role
        else 'buyer'::public.app_role
      end,
      'incomplete',
      0,
      1,
      case
        when users.email_confirmed_at is not null then 'pending'::public.mh_verification_status
        else 'draft'::public.mh_verification_status
      end,
      users.raw_user_meta_data->>'avatar_url'
    from auth.users as users
    on conflict (id) do nothing;
  elsif profile_role_udt = 'mh_user_role' then
    insert into public.profiles (
      id,
      email,
      full_name,
      phone,
      role,
      profile_status,
      trust_level,
      onboarding_step,
      verification_status,
      avatar_url
    )
    select
      users.id,
      users.email,
      coalesce(users.raw_user_meta_data->>'full_name', users.raw_user_meta_data->>'name'),
      coalesce(users.phone, users.raw_user_meta_data->>'phone'),
      case
        when users.raw_user_meta_data->>'role' in ('buyer', 'seller', 'both', 'admin', 'supplier_success')
          then (users.raw_user_meta_data->>'role')::public.mh_user_role
        else 'buyer'::public.mh_user_role
      end,
      'incomplete',
      0,
      1,
      case
        when users.email_confirmed_at is not null then 'pending'::public.mh_verification_status
        else 'draft'::public.mh_verification_status
      end,
      users.raw_user_meta_data->>'avatar_url'
    from auth.users as users
    on conflict (id) do nothing;
  else
    raise notice 'Skipping profile backfill: profiles.role type is %', coalesce(profile_role_udt, 'missing');
  end if;
end $$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text unique,
  gst_number text,
  pan_number text,
  business_type text,
  website text,
  linkedin_url text,
  company_size text,
  years_in_business integer,
  annual_production_capacity text,
  export_capability boolean not null default false,
  logo_url text,
  banner_url text,
  verification_status public.mh_verification_status not null default 'pending',
  trust_level integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists companies_owner_id_idx on public.companies(owner_id);
create index if not exists companies_profile_id_idx on public.companies(profile_id);
create index if not exists companies_slug_idx on public.companies(slug);
create index if not exists companies_gst_number_idx on public.companies(gst_number) where gst_number is not null;
create index if not exists companies_active_idx on public.companies(deleted_at) where deleted_at is null;

create table if not exists public.taxonomy (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type public.mh_taxonomy_type not null,
  parent_id uuid references public.taxonomy(id) on delete set null,
  industry_code text,
  icon text,
  description text,
  seo_title text,
  seo_description text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists taxonomy_type_idx on public.taxonomy(type);
create index if not exists taxonomy_parent_id_idx on public.taxonomy(parent_id);
create index if not exists taxonomy_active_sort_idx on public.taxonomy(is_active, sort_order, name);
create index if not exists taxonomy_name_trgm_idx on public.taxonomy using gin (name gin_trgm_ops);

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'industries'
      and table_type = 'BASE TABLE'
  ) then
    raise notice 'Skipping industries view: normalized industries table already exists.';
  else
    execute $view$
      create or replace view public.industries as
      select
        id,
        name,
        slug,
        icon,
        description,
        is_active,
        sort_order,
        parent_id as parent_industry_id,
        created_at,
        updated_at
      from public.taxonomy
      where type = 'industry'
        and deleted_at is null
    $view$;
  end if;
end $$;

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  iso2 char(2),
  iso3 char(3),
  phone_code text,
  currency_code text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (name),
  unique (iso2),
  unique (iso3)
);

create table if not exists public.states (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete cascade,
  name text not null,
  state_code text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (country_id, name)
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete cascade,
  state_id uuid not null references public.states(id) on delete cascade,
  name text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (state_id, name)
);

create index if not exists countries_active_name_idx on public.countries(is_active, name);
create index if not exists countries_name_trgm_idx on public.countries using gin (name gin_trgm_ops);
create index if not exists states_country_active_name_idx on public.states(country_id, is_active, name);
create index if not exists states_name_trgm_idx on public.states using gin (name gin_trgm_ops);
create index if not exists cities_state_active_name_idx on public.cities(state_id, is_active, name);
create index if not exists cities_name_trgm_idx on public.cities using gin (name gin_trgm_ops);

alter table if exists public.companies
  add column if not exists country_id uuid references public.countries(id) on delete set null,
  add column if not exists state_id uuid references public.states(id) on delete set null,
  add column if not exists city_id uuid references public.cities(id) on delete set null,
  add column if not exists factory_address text;

create table if not exists public.seller_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  primary_industry_id uuid references public.taxonomy(id) on delete set null,
  production_capacity text,
  certifications text[] not null default '{}',
  accepts_rfqs boolean not null default true,
  response_time_hours integer,
  profile_completion_percent integer not null default 0 check (profile_completion_percent between 0 and 100),
  verification_status public.mh_verification_status not null default 'pending',
  trust_level integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (profile_id),
  unique (company_id)
);

create table if not exists public.buyer_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  primary_procurement_category_id uuid references public.taxonomy(id) on delete set null,
  annual_procurement_volume text,
  profile_completion_percent integer not null default 0 check (profile_completion_percent between 0 and 100),
  verification_status public.mh_verification_status not null default 'pending',
  trust_level integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (profile_id)
);

create index if not exists seller_profiles_company_id_idx on public.seller_profiles(company_id);
create index if not exists seller_profiles_industry_idx on public.seller_profiles(primary_industry_id);
create index if not exists buyer_profiles_company_id_idx on public.buyer_profiles(company_id);

create table if not exists public.onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.mh_user_role not null,
  flow_key text not null default 'default',
  flow_version integer not null default 1,
  status public.mh_onboarding_session_status not null default 'active',
  current_step text not null,
  draft_payload jsonb not null default '{}'::jsonb,
  completion_percentage integer not null default 0 check (completion_percentage between 0 and 100),
  last_completed_step text,
  skipped_steps text[] not null default '{}',
  skipped_step_details jsonb not null default '{}'::jsonb,
  is_completed boolean not null default false,
  completed_at timestamptz,
  abandoned_at timestamptz,
  archived_at timestamptz,
  expires_at timestamptz,
  started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table if exists public.onboarding_sessions
  add column if not exists status public.mh_onboarding_session_status not null default 'active',
  add column if not exists skipped_step_details jsonb not null default '{}'::jsonb,
  add column if not exists abandoned_at timestamptz,
  add column if not exists archived_at timestamptz;

create unique index if not exists onboarding_sessions_active_unique_idx
  on public.onboarding_sessions(user_id, role, flow_key, flow_version)
  where status = 'active' and is_completed = false and deleted_at is null;

create index if not exists onboarding_sessions_user_id_idx on public.onboarding_sessions(user_id);
create index if not exists onboarding_sessions_role_idx on public.onboarding_sessions(role);
create index if not exists onboarding_sessions_status_idx on public.onboarding_sessions(status);
create index if not exists onboarding_sessions_current_step_idx on public.onboarding_sessions(current_step);
create index if not exists onboarding_sessions_updated_at_idx on public.onboarding_sessions(updated_at desc);
create index if not exists onboarding_sessions_draft_payload_gin_idx on public.onboarding_sessions using gin (draft_payload);
create index if not exists onboarding_sessions_skipped_step_details_gin_idx on public.onboarding_sessions using gin (skipped_step_details);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_profile_id uuid references public.seller_profiles(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  title text not null,
  slug text unique,
  description text,
  taxonomy_id uuid references public.taxonomy(id) on delete set null,
  moq text,
  lead_time text,
  production_capacity text,
  certifications text[] not null default '{}',
  country_id uuid references public.countries(id) on delete set null,
  state_id uuid references public.states(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  is_active boolean not null default true,
  moderation_status public.mh_verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table if exists public.listings
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists seller_profile_id uuid references public.seller_profiles(id) on delete set null,
  add column if not exists company_id uuid references public.companies(id) on delete set null,
  add column if not exists taxonomy_id uuid references public.taxonomy(id) on delete set null,
  add column if not exists moq text,
  add column if not exists lead_time text,
  add column if not exists production_capacity text,
  add column if not exists certifications text[] not null default '{}',
  add column if not exists country_id uuid references public.countries(id) on delete set null,
  add column if not exists state_id uuid references public.states(id) on delete set null,
  add column if not exists city_id uuid references public.cities(id) on delete set null,
  add column if not exists moderation_status public.mh_verification_status not null default 'pending',
  add column if not exists deleted_at timestamptz;

create index if not exists listings_seller_profile_id_idx on public.listings(seller_profile_id);
create index if not exists listings_company_id_idx on public.listings(company_id);
create index if not exists listings_taxonomy_id_idx on public.listings(taxonomy_id);
create index if not exists listings_location_idx on public.listings(country_id, state_id, city_id);
create index if not exists listings_active_idx on public.listings(is_active, deleted_at) where deleted_at is null;
create index if not exists listings_title_trgm_idx on public.listings using gin (title gin_trgm_ops);

create table if not exists public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  file_url text not null,
  storage_path text,
  file_type public.mh_media_type not null,
  mime_type text,
  file_size_bytes bigint,
  thumbnail_url text,
  preview_url text,
  alt_text text,
  is_primary boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists listing_media_listing_id_idx on public.listing_media(listing_id);
create index if not exists listing_media_primary_idx on public.listing_media(listing_id, is_primary) where deleted_at is null;
create index if not exists listing_media_file_type_idx on public.listing_media(file_type);

create table if not exists public.rfqs (
  id uuid primary key default gen_random_uuid(),
  buyer_profile_id uuid references public.buyer_profiles(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  taxonomy_id uuid references public.taxonomy(id) on delete set null,
  title text not null,
  slug text unique,
  description text,
  quantity text,
  target_price text,
  delivery_timeline text,
  certifications_required text[] not null default '{}',
  country_id uuid references public.countries(id) on delete set null,
  state_id uuid references public.states(id) on delete set null,
  city_id uuid references public.cities(id) on delete set null,
  status public.mh_rfq_status not null default 'draft',
  visibility_level text not null default 'standard',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table if exists public.rfqs
  add column if not exists buyer_profile_id uuid references public.buyer_profiles(id) on delete set null,
  add column if not exists company_id uuid references public.companies(id) on delete set null,
  add column if not exists taxonomy_id uuid references public.taxonomy(id) on delete set null,
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists quantity text,
  add column if not exists target_price text,
  add column if not exists delivery_timeline text,
  add column if not exists certifications_required text[] not null default '{}',
  add column if not exists country_id uuid references public.countries(id) on delete set null,
  add column if not exists state_id uuid references public.states(id) on delete set null,
  add column if not exists city_id uuid references public.cities(id) on delete set null,
  add column if not exists status public.mh_rfq_status not null default 'draft',
  add column if not exists visibility_level text not null default 'standard',
  add column if not exists expires_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

create index if not exists rfqs_buyer_profile_id_idx on public.rfqs(buyer_profile_id);
create index if not exists rfqs_company_id_idx on public.rfqs(company_id);
create index if not exists rfqs_taxonomy_id_idx on public.rfqs(taxonomy_id);
create index if not exists rfqs_location_idx on public.rfqs(country_id, state_id, city_id);
create index if not exists rfqs_status_idx on public.rfqs(status);
create index if not exists rfqs_created_at_idx on public.rfqs(created_at desc);
create index if not exists rfqs_title_trgm_idx on public.rfqs using gin (title gin_trgm_ops);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  seller_profile_id uuid references public.seller_profiles(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null,
  quote_number text,
  price text,
  currency_code text not null default 'INR',
  lead_time text,
  moq text,
  message text,
  attachments jsonb not null default '[]'::jsonb,
  status public.mh_quote_status not null default 'draft',
  submitted_at timestamptz,
  viewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table if exists public.quotes
  add column if not exists rfq_id uuid references public.rfqs(id) on delete cascade,
  add column if not exists seller_profile_id uuid references public.seller_profiles(id) on delete set null,
  add column if not exists company_id uuid references public.companies(id) on delete set null,
  add column if not exists listing_id uuid references public.listings(id) on delete set null,
  add column if not exists quote_number text,
  add column if not exists price text,
  add column if not exists currency_code text not null default 'INR',
  add column if not exists lead_time text,
  add column if not exists moq text,
  add column if not exists message text,
  add column if not exists attachments jsonb not null default '[]'::jsonb,
  add column if not exists status public.mh_quote_status not null default 'draft',
  add column if not exists submitted_at timestamptz,
  add column if not exists viewed_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

create index if not exists quotes_rfq_id_idx on public.quotes(rfq_id);
create index if not exists quotes_seller_profile_id_idx on public.quotes(seller_profile_id);
create index if not exists quotes_company_id_idx on public.quotes(company_id);
create index if not exists quotes_listing_id_idx on public.quotes(listing_id);
create index if not exists quotes_status_idx on public.quotes(status);
create index if not exists quotes_submitted_at_idx on public.quotes(submitted_at desc);

create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid references public.rfqs(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  buyer_profile_id uuid references public.buyer_profiles(id) on delete set null,
  seller_profile_id uuid references public.seller_profiles(id) on delete set null,
  status public.mh_message_thread_status not null default 'open',
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists message_threads_rfq_id_idx on public.message_threads(rfq_id);
create index if not exists message_threads_quote_id_idx on public.message_threads(quote_id);
create index if not exists message_threads_buyer_profile_id_idx on public.message_threads(buyer_profile_id);
create index if not exists message_threads_seller_profile_id_idx on public.message_threads(seller_profile_id);
create index if not exists message_threads_last_message_at_idx on public.message_threads(last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists messages_thread_id_idx on public.messages(thread_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_created_at_idx on public.messages(created_at desc);

create table if not exists public.verification_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  document_type text not null,
  file_url text not null,
  storage_path text,
  status public.mh_verification_status not null default 'pending',
  reviewer_id uuid references auth.users(id) on delete set null,
  reviewer_notes text,
  reviewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists verification_documents_profile_id_idx on public.verification_documents(profile_id);
create index if not exists verification_documents_company_id_idx on public.verification_documents(company_id);
create index if not exists verification_documents_status_idx on public.verification_documents(status);

create table if not exists public.profile_completion (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  section text not null,
  percent_complete integer not null default 0 check (percent_complete between 0 and 100),
  missing_fields text[] not null default '{}',
  recommendations text[] not null default '{}',
  is_blocking boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, section)
);

create index if not exists profile_completion_profile_id_idx on public.profile_completion(profile_id);
create index if not exists profile_completion_company_id_idx on public.profile_completion(company_id);

create table if not exists public.supplier_trust_scores (
  id uuid primary key default gen_random_uuid(),
  seller_profile_id uuid not null references public.seller_profiles(id) on delete cascade,
  identity_score numeric(5, 2) not null default 0,
  business_score numeric(5, 2) not null default 0,
  profile_quality_score numeric(5, 2) not null default 0,
  behavior_score numeric(5, 2) not null default 0,
  marketplace_performance_score numeric(5, 2) not null default 0,
  total_score numeric(5, 2) not null default 0,
  trust_level integer not null default 0,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_profile_id)
);

create index if not exists supplier_trust_scores_total_score_idx on public.supplier_trust_scores(total_score desc);
create index if not exists supplier_trust_scores_trust_level_idx on public.supplier_trust_scores(trust_level);

create table if not exists public.supplier_activity_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  seller_profile_id uuid references public.seller_profiles(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  score_impact numeric(6, 2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists supplier_activity_events_profile_id_idx on public.supplier_activity_events(profile_id);
create index if not exists supplier_activity_events_seller_profile_id_idx on public.supplier_activity_events(seller_profile_id);
create index if not exists supplier_activity_events_company_id_idx on public.supplier_activity_events(company_id);
create index if not exists supplier_activity_events_event_type_idx on public.supplier_activity_events(event_type);
create index if not exists supplier_activity_events_occurred_at_idx on public.supplier_activity_events(occurred_at desc);

create table if not exists public.supplier_response_metrics (
  id uuid primary key default gen_random_uuid(),
  seller_profile_id uuid not null references public.seller_profiles(id) on delete cascade,
  rfq_received_count integer not null default 0,
  rfq_replied_count integer not null default 0,
  average_response_hours numeric(8, 2),
  response_rate numeric(5, 2) not null default 0,
  last_response_at timestamptz,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (seller_profile_id)
);

create index if not exists supplier_response_metrics_response_rate_idx on public.supplier_response_metrics(response_rate desc);
create index if not exists supplier_response_metrics_average_response_hours_idx on public.supplier_response_metrics(average_response_hours asc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  email_to text not null,
  template_key text not null,
  subject text not null,
  provider text,
  provider_message_id text,
  status text not null default 'queued',
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_logs_profile_id_idx on public.email_logs(profile_id);
create index if not exists email_logs_template_key_idx on public.email_logs(template_key);
create index if not exists email_logs_status_idx on public.email_logs(status);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'system',
  href text,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists notifications_profile_unread_idx on public.notifications(profile_id, read_at, created_at desc) where deleted_at is null;

create or replace function public.calculate_supplier_trust_level(score numeric)
returns integer
language sql
immutable
as $$
  select case
    when score >= 85 then 4
    when score >= 65 then 3
    when score >= 45 then 2
    when score >= 20 then 1
    else 0
  end;
$$;

create or replace function public.calculate_weighted_supplier_trust_score(
  identity_score numeric,
  business_score numeric,
  profile_quality_score numeric,
  behavior_score numeric,
  marketplace_performance_score numeric
)
returns numeric
language sql
immutable
as $$
  select round((
    coalesce(identity_score, 0) * 0.15 +
    coalesce(business_score, 0) * 0.25 +
    coalesce(profile_quality_score, 0) * 0.15 +
    coalesce(behavior_score, 0) * 0.25 +
    coalesce(marketplace_performance_score, 0) * 0.20
  )::numeric, 2);
$$;

create table if not exists public.trust_tiers (
  level integer primary key,
  name text not null,
  badge_label text not null,
  min_score numeric(5, 2) not null,
  ranking_boost numeric(5, 2) not null default 0,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.trust_tiers (level, name, badge_label, min_score, ranking_boost, description)
values
  (0, 'New Supplier', 'New Supplier', 0, 0, 'Account exists. Visible with baseline marketplace exposure.'),
  (1, 'Email Verified', 'Email Verified', 20, 2, 'Email verification completed. Small trust and ranking lift.'),
  (2, 'Business Profile Complete', 'Business Profile Complete', 45, 6, 'Company details and sourcing profile are substantially complete.'),
  (3, 'Document Verified', 'Verified Business', 65, 12, 'Business documents submitted and reviewed or review-ready.'),
  (4, 'Trusted Supplier', 'Trusted Supplier', 85, 20, 'Strong identity, business, profile, behavior, and marketplace performance signals.')
on conflict (level) do update
set name = excluded.name,
    badge_label = excluded.badge_label,
    min_score = excluded.min_score,
    ranking_boost = excluded.ranking_boost,
    description = excluded.description,
    updated_at = now();

insert into public.taxonomy (name, slug, type, industry_code, icon, description, sort_order)
values
  ('Metals & Steel', 'metals-steel', 'industry', 'METALS', 'Factory', 'Steel, stainless steel, aluminum, copper, alloys, and industrial metal products.', 10),
  ('Industrial Machinery', 'industrial-machinery', 'industry', 'MACHINERY', 'Cog', 'Manufacturing machines, production equipment, automation, and plant machinery.', 20),
  ('Construction Materials', 'construction-materials', 'industry', 'CONSTRUCTION', 'Building2', 'Structural materials, fabrication inputs, and project procurement supplies.', 30),
  ('Electrical & Power', 'electrical-power', 'industry', 'ELECTRICAL', 'Zap', 'Electrical equipment, panels, cables, transformers, and power infrastructure.', 40),
  ('Industrial Chemicals', 'industrial-chemicals', 'industry', 'CHEMICALS', 'FlaskConical', 'Industrial chemicals, coatings, process chemicals, and specialty inputs.', 50),
  ('Automotive & Components', 'automotive-components', 'industry', 'AUTO', 'Truck', 'Automotive parts, components, tooling, and manufacturing supply chains.', 60),
  ('Pipes, Valves & Fittings', 'pipes-valves-fittings', 'industry', 'PVF', 'GitBranch', 'Pipes, tubes, valves, fittings, flanges, and flow-control products.', 70),
  ('Packaging & Material Handling', 'packaging-material-handling', 'industry', 'PACKAGING', 'Package', 'Industrial packaging, pallets, crates, conveyors, and handling systems.', 80),
  ('Tools, Dies & Fabrication', 'tools-dies-fabrication', 'industry', 'TOOLS', 'Wrench', 'Fabrication services, dies, tools, machining, welding, and job work.', 90),
  ('Safety & MRO Supplies', 'safety-mro-supplies', 'industry', 'MRO', 'ShieldCheck', 'Safety equipment, maintenance supplies, repair products, and operations consumables.', 100)
on conflict (slug) do update
set name = excluded.name,
    type = excluded.type,
    industry_code = excluded.industry_code,
    icon = excluded.icon,
    description = excluded.description,
    sort_order = excluded.sort_order,
    updated_at = now();

insert into public.countries (name, iso2, iso3, phone_code, currency_code, sort_order)
values ('India', 'IN', 'IND', '+91', 'INR', 1)
on conflict (iso2) do update
set name = excluded.name,
    iso3 = excluded.iso3,
    phone_code = excluded.phone_code,
    currency_code = excluded.currency_code,
    sort_order = excluded.sort_order,
    updated_at = now();
