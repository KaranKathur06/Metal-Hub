-- MetalHub: OAuth Identity Linking & Duplicate Prevention
-- This migration adds:
-- 1. auth_providers tracking table for multi-provider identity linking
-- 2. Updated profile trigger that merges OAuth + email identities
-- 3. Unique email constraint on profiles
-- 4. Helper function for identity resolution

-- ═══════════════════════════════════════════════════════
-- 1. AUTH PROVIDERS TABLE
-- Tracks which authentication providers are linked to each profile
-- ═══════════════════════════════════════════════════════

create table if not exists public.auth_providers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,           -- 'email', 'google', 'apple', etc.
  provider_user_id text,            -- external provider user ID (e.g. Google sub)
  provider_email text,              -- email from that provider
  linked_at timestamptz not null default now(),
  last_sign_in_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Prevent duplicate provider links per profile
create unique index if not exists auth_providers_profile_provider_unique
  on public.auth_providers(profile_id, provider);

-- Prevent one auth.users row from being linked to multiple profiles
create unique index if not exists auth_providers_auth_user_provider_unique
  on public.auth_providers(auth_user_id, provider);

create index if not exists auth_providers_profile_id_idx on public.auth_providers(profile_id);
create index if not exists auth_providers_auth_user_id_idx on public.auth_providers(auth_user_id);
create index if not exists auth_providers_email_idx on public.auth_providers(provider_email);


-- ═══════════════════════════════════════════════════════
-- 2. ADD MISSING COLUMNS TO PROFILES & UNIQUE INDEX
-- Handling older templates that lack these foundation columns
-- ═══════════════════════════════════════════════════════

do $$
begin
  create type public.mh_user_role as enum ('buyer', 'seller', 'both', 'admin', 'supplier_success');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.mh_profile_status as enum ('incomplete', 'in_progress', 'complete');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.mh_verification_status as enum ('draft', 'pending', 'in_review', 'approved', 'rejected', 'expired');
exception when duplicate_object then null;
end $$;

alter table if exists public.profiles 
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists phone text,
  add column if not exists role public.mh_user_role not null default 'buyer',
  add column if not exists profile_status public.mh_profile_status not null default 'incomplete',
  add column if not exists trust_level integer not null default 0,
  add column if not exists onboarding_step integer not null default 1,
  add column if not exists verification_status public.mh_verification_status not null default 'pending',
  add column if not exists deleted_at timestamptz;

-- Backfill emails from auth.users if they are missing
update public.profiles p
set email = lower(trim(u.email))
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');

create unique index if not exists profiles_email_unique_active
  on public.profiles(email)
  where email is not null and deleted_at is null;


-- ═══════════════════════════════════════════════════════
-- 3. IDENTITY RESOLUTION FUNCTION
-- Called by the trigger to find existing profile by email
-- ═══════════════════════════════════════════════════════

drop function if exists public.resolve_identity_by_email(text);
create or replace function public.resolve_identity_by_email(lookup_email text)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  existing_profile_id uuid;
begin
  if lookup_email is null or lookup_email = '' then
    return null;
  end if;

  select id into existing_profile_id
  from public.profiles
  where email = lower(trim(lookup_email))
    and deleted_at is null
  limit 1;

  return existing_profile_id;
end;
$$;


-- ═══════════════════════════════════════════════════════
-- 4. UPGRADED PROFILE TRIGGER
-- Handles both new registrations AND OAuth identity merging
-- ═══════════════════════════════════════════════════════

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.mh_user_role;
  clean_email text;
  existing_profile_id uuid;
  auth_provider_name text;
  provider_uid text;
begin
  -- Determine the provider from the new auth user
  auth_provider_name := coalesce(
    new.raw_app_meta_data->>'provider',
    'email'
  );

  -- Clean the email
  clean_email := lower(trim(coalesce(new.email, '')));
  if clean_email = '' then
    clean_email := null;
  end if;

  -- Determine requested role
  requested_role := case
    when new.raw_user_meta_data->>'role' in ('buyer', 'seller', 'both', 'admin', 'supplier_success')
      then (new.raw_user_meta_data->>'role')::public.mh_user_role
    else 'buyer'::public.mh_user_role
  end;

  -- Get provider-specific user ID
  provider_uid := coalesce(
    new.raw_user_meta_data->>'sub',           -- Google/OAuth sub claim
    new.raw_user_meta_data->>'provider_id',   -- some providers use this
    new.id::text                              -- fallback to auth user id
  );

  -- ═══ IDENTITY RESOLUTION ═══
  -- Check if a profile already exists with this email
  if clean_email is not null then
    existing_profile_id := public.resolve_identity_by_email(clean_email);
  end if;

  if existing_profile_id is not null and existing_profile_id != new.id::uuid then
    -- ════════════════════════════════════════════════════
    -- IDENTITY MERGE: Profile already exists for this email
    -- Link this new auth user to the existing profile
    -- DO NOT create a duplicate profile
    -- ════════════════════════════════════════════════════

    -- Update existing profile with any new data from OAuth (avatar, name)
    update public.profiles
    set
      avatar_url = coalesce(
        public.profiles.avatar_url,
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'picture'
      ),
      full_name = coalesce(
        public.profiles.full_name,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name'
      ),
      updated_at = now()
    where id = existing_profile_id;

    -- Record the provider link
    insert into public.auth_providers (
      profile_id, auth_user_id, provider, provider_user_id, provider_email,
      last_sign_in_at, metadata
    )
    values (
      existing_profile_id,
      new.id,
      auth_provider_name,
      provider_uid,
      clean_email,
      now(),
      jsonb_build_object(
        'linked_via', 'auto_merge',
        'original_metadata', new.raw_user_meta_data
      )
    )
    on conflict (profile_id, provider) do update
    set
      auth_user_id = excluded.auth_user_id,
      provider_user_id = excluded.provider_user_id,
      last_sign_in_at = now(),
      updated_at = now();

  else
    -- ════════════════════════════════════════════════════
    -- NEW PROFILE: No existing email match
    -- Create profile and record provider
    -- ════════════════════════════════════════════════════

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
      new.id::uuid,
      clean_email,
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
      coalesce(new.phone, new.raw_user_meta_data->>'phone'),
      requested_role,
      'incomplete',
      0,
      1,
      case when new.email_confirmed_at is not null then 'pending' else 'draft' end,
      coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
    )
    on conflict (id) do update
    set email = coalesce(excluded.email, public.profiles.email),
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        phone = coalesce(public.profiles.phone, excluded.phone),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
        updated_at = now();

    -- Record the provider link
    insert into public.auth_providers (
      profile_id, auth_user_id, provider, provider_user_id, provider_email,
      last_sign_in_at
    )
    values (
      new.id,
      new.id,
      auth_provider_name,
      provider_uid,
      clean_email,
      now()
    )
    on conflict (profile_id, provider) do update
    set
      last_sign_in_at = now(),
      updated_at = now();
  end if;

  return new;
end;
$$;

-- Recreate the trigger
drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();


-- ═══════════════════════════════════════════════════════
-- 5. BACKFILL: Register existing auth users in auth_providers
-- ═══════════════════════════════════════════════════════

insert into public.auth_providers (
  profile_id,
  auth_user_id,
  provider,
  provider_user_id,
  provider_email,
  last_sign_in_at
)
select
  p.id,
  u.id,
  coalesce(u.raw_app_meta_data->>'provider', 'email'),
  coalesce(u.raw_user_meta_data->>'sub', u.id::text),
  u.email,
  coalesce(u.last_sign_in_at, u.created_at)
from auth.users u
inner join public.profiles p on p.id = u.id
on conflict (profile_id, provider) do nothing;


-- ═══════════════════════════════════════════════════════
-- 6. RLS for auth_providers
-- ═══════════════════════════════════════════════════════

alter table public.auth_providers enable row level security;

-- Users can view their own provider links
create policy "Users can view own providers"
  on public.auth_providers for select
  using (profile_id = auth.uid() or auth_user_id = auth.uid());

-- Only the system can insert/update (via security definer trigger)
-- No direct insert/update/delete policies for regular users
