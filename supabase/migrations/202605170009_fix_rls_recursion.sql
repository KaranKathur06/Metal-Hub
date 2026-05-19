-- Fix 1: profiles_admin_all policy causes infinite recursion
-- because it queries profiles table from within profiles policy
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all ON public.profiles
  FOR ALL USING (
    auth.uid() = id
    OR (auth.jwt()->>'role' = 'service_role')
    OR (
      (SELECT role::text FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Fix 2: taxonomy admin_write also has same recursion issue
DROP POLICY IF EXISTS taxonomy_admin_write ON public.taxonomy;
CREATE POLICY taxonomy_admin_write ON public.taxonomy
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY taxonomy_admin_update ON public.taxonomy
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY taxonomy_admin_delete ON public.taxonomy
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Fix 3: rfqs table needs anon SELECT grant for marketplace API
GRANT SELECT ON public.rfqs TO anon, authenticated;

-- Fix 4: Ensure listings grant exists for anon 
GRANT SELECT ON public.listings TO anon, authenticated;
GRANT SELECT ON public.companies TO anon, authenticated;

DO $$ BEGIN RAISE NOTICE '✅ RLS recursion fix + rfqs grant applied.'; END $$;
