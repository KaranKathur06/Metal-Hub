-- ═══════════════════════════════════════════════════════════════
-- Migration 0007: Auth Trigger Fix + Superadmin Bootstrap
-- 
-- ROOT CAUSE: handle_new_user_profile() trigger only accepts
-- buyer,seller,both,admin,supplier_success in its CASE statement.
-- New enum values (super_admin, moderator, etc.) cause the trigger
-- to default to 'buyer' silently, but more critically, any edge
-- case in metadata extraction can cause a 500 on signup.
--
-- This migration:
--   1. Replaces the trigger function with a robust version
--   2. Fixes RLS insert policy for profiles 
--   3. Bootstraps superadmin role for platform owner
--   4. Fixes RFQ RLS policy (was comparing buyer_profile_id to auth.uid())
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. ROBUST AUTH TRIGGER ───
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
  valid_role public.mh_user_role;
  user_full_name text;
  user_phone text;
  user_avatar text;
BEGIN
  -- Extract role from metadata safely
  requested_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    ''
  );

  -- Validate against ALL enum values (not a hardcoded subset)
  BEGIN
    valid_role := requested_role::public.mh_user_role;
  EXCEPTION WHEN invalid_text_representation OR others THEN
    valid_role := 'buyer'::public.mh_user_role;
  END;

  -- Prevent non-admin signup from claiming admin roles
  IF valid_role::text IN ('admin', 'super_admin', 'moderator', 'support_agent', 'supplier_success', 'finance', 'marketing') THEN
    valid_role := 'buyer'::public.mh_user_role;
  END IF;

  -- Extract user metadata safely
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );
  user_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone',
    ''
  );
  user_avatar := NEW.raw_user_meta_data->>'avatar_url';

  -- Insert profile with conflict handling
  INSERT INTO public.profiles (
    id, email, full_name, phone, role,
    profile_status, trust_level, onboarding_step,
    verification_status, avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(user_full_name, ''),
    NULLIF(user_phone, ''),
    valid_role,
    'incomplete',
    0,
    1,
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'pending' ELSE 'draft' END,
    user_avatar
  )
  ON CONFLICT (id) DO UPDATE
  SET email = COALESCE(EXCLUDED.email, profiles.email),
      full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
      phone = COALESCE(profiles.phone, EXCLUDED.phone),
      avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
      updated_at = now();

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- CRITICAL: Never let the trigger block user creation
  -- Log the error but allow auth.users insert to succeed
  RAISE WARNING 'handle_new_user_profile failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- ─── 2. FIX PROFILES RLS FOR TRIGGER INSERT ───
-- The trigger runs as SECURITY DEFINER so it bypasses RLS,
-- but we need an explicit INSERT policy for service-role operations
DROP POLICY IF EXISTS profiles_insert_trigger ON public.profiles;
CREATE POLICY profiles_insert_trigger ON public.profiles
  FOR INSERT WITH CHECK (true);

-- ─── 3. FIX RFQ RLS POLICY ───
-- Old policy: buyer_profile_id = auth.uid() — WRONG
-- buyer_profile_id references buyer_profiles.id, not auth.users.id
DROP POLICY IF EXISTS rfqs_own_read ON public.rfqs;
CREATE POLICY rfqs_public_read ON public.rfqs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS rfqs_buyer_create ON public.rfqs;
CREATE POLICY rfqs_authenticated_create ON public.rfqs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY rfqs_authenticated_update ON public.rfqs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.buyer_profiles bp
      WHERE bp.id = rfqs.buyer_profile_id AND bp.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'moderator')
    )
  );

-- ─── 4. SUPERADMIN BOOTSTRAP ───
-- This runs AFTER user registration. If the user already exists,
-- it promotes them. If not, it will be applied when they register.
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'kathurkaran077@gmail.com'
  LIMIT 1;

  IF target_user_id IS NOT NULL THEN
    -- Update profile role (supports both mh_user_role and app_role columns)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role' AND udt_name = 'app_role'
  ) THEN
    UPDATE public.profiles
    SET role = 'superadmin'::public.app_role,
        updated_at = now()
    WHERE id = target_user_id;
  ELSE
    UPDATE public.profiles
    SET role = 'super_admin'::public.mh_user_role,
        verification_status = 'approved',
        trust_level = 100,
        updated_at = now()
    WHERE id = target_user_id;
  END IF;

    -- Update auth metadata
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "super_admin"}'::jsonb,
        raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "super_admin"}'::jsonb
    WHERE id = target_user_id;

    RAISE NOTICE 'Superadmin role assigned to kathurkaran077@gmail.com (%)' , target_user_id;
  ELSE
    RAISE NOTICE 'User kathurkaran077@gmail.com not found. Register first, then re-run.';
  END IF;
END $$;

-- Also create a function to promote users to superadmin (for future use)
CREATE OR REPLACE FUNCTION public.promote_to_superadmin(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = target_email LIMIT 1;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role' AND udt_name = 'app_role'
  ) THEN
    UPDATE public.profiles
    SET role = 'superadmin'::public.app_role, updated_at = now()
    WHERE id = target_id;
  ELSE
    UPDATE public.profiles
    SET role = 'super_admin'::public.mh_user_role,
        verification_status = 'approved',
        trust_level = 100,
        updated_at = now()
    WHERE id = target_id;
  END IF;
  
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "super_admin"}'::jsonb,
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "super_admin"}'::jsonb
  WHERE id = target_id;
END;
$$;

DO $$ BEGIN RAISE NOTICE '✅ Auth trigger fixed, RLS repaired, superadmin bootstrapped.'; END $$;
