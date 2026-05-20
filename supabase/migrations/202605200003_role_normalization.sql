-- Normalize super-admin role storage + JWT metadata.
-- profiles.role may be app_role (superadmin) OR mh_user_role (super_admin).
-- Application code normalizes both → super_admin via lib/auth/rbac.ts.

DO $$
DECLARE
  profile_role_udt text;
BEGIN
  SELECT udt_name
  INTO profile_role_udt
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'role';

  IF profile_role_udt = 'app_role' THEN
    -- app_role enum: buyer | seller | admin | superadmin (no super_admin value)
    UPDATE public.profiles
    SET role = 'superadmin'::public.app_role,
        updated_at = now()
    WHERE role::text IN ('superAdmin', 'SUPERADMIN', 'super_admin');

    RAISE NOTICE 'Normalized profiles.role to superadmin (app_role enum)';
  ELSIF profile_role_udt = 'mh_user_role' THEN
    UPDATE public.profiles
    SET role = 'super_admin'::public.mh_user_role,
        updated_at = now()
    WHERE role::text IN ('superadmin', 'superAdmin', 'SUPERADMIN');

    RAISE NOTICE 'Normalized profiles.role to super_admin (mh_user_role enum)';
  ELSE
    RAISE NOTICE 'profiles.role udt_name=% — skipped enum normalization', profile_role_udt;
  END IF;
END $$;

-- JWT / app_metadata: canonical super_admin for middleware + API (lib/auth/rbac)
UPDATE auth.users u
SET
  raw_user_meta_data = COALESCE(u.raw_user_meta_data, '{}'::jsonb) || '{"role":"super_admin"}'::jsonb,
  raw_app_meta_data = COALESCE(u.raw_app_meta_data, '{}'::jsonb) || '{"role":"super_admin"}'::jsonb
FROM public.profiles p
WHERE p.id = u.id
  AND p.role::text IN ('superadmin', 'super_admin')
  AND (
    COALESCE(u.raw_user_meta_data->>'role', '') IN ('superadmin', 'super_admin', '')
    OR COALESCE(u.raw_app_meta_data->>'role', '') IN ('superadmin', 'super_admin', '')
  );

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
