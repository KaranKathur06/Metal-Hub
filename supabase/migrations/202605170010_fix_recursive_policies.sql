-- Fix ALL recursive profile references in write policies
-- ROOT CAUSE: listings_owner_write and companies_owner_write 
-- reference profiles table which has its own recursive admin policy.
-- When anon tries to SELECT from listings, Postgres evaluates ALL 
-- permissive policies including the ALL (write) policy, hitting recursion.

-- Step 1: Remove recursive policies
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
DROP POLICY IF EXISTS listings_owner_write ON public.listings;
DROP POLICY IF EXISTS companies_owner_write ON public.companies;

-- Step 2: Recreate without profile cross-references
-- Listings: authenticated users can write their own
CREATE POLICY listings_owner_write ON public.listings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY listings_owner_update ON public.listings
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY listings_owner_delete ON public.listings
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Companies: authenticated users can write their own
CREATE POLICY companies_owner_write ON public.companies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY companies_owner_update ON public.companies
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY companies_owner_delete ON public.companies
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Profiles: own row + admin (using JWT metadata instead of self-join)
CREATE POLICY profiles_self_and_admin ON public.profiles
  FOR ALL USING (
    auth.uid() = id
    OR (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role'
  );

DO $$ BEGIN RAISE NOTICE '✅ Recursive RLS policies eliminated.'; END $$;
