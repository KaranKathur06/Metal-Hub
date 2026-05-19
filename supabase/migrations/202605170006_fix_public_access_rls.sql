-- ═══════════════════════════════════════════════════════════════
-- Metal Hub — Fix Public Access: RLS + Grants for Public Tables
--
-- Problem: Client-side Supabase calls with anon key get 401 
-- because tables lack RLS policies and anon role grants.
--
-- Solution: Enable RLS + add public read policies + grant anon access.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. GRANT USAGE to anon and authenticated roles ───
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ─── 2. PUBLIC-READ TABLES (no auth required for SELECT) ───
-- These are marketplace-facing, must be readable by anonymous visitors.

-- taxonomy (capabilities, categories, industries)
ALTER TABLE public.taxonomy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "taxonomy_public_read" ON public.taxonomy;
CREATE POLICY "taxonomy_public_read" ON public.taxonomy
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "taxonomy_admin_write" ON public.taxonomy;
CREATE POLICY "taxonomy_admin_write" ON public.taxonomy
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin', 'marketing'))
  );
GRANT SELECT ON public.taxonomy TO anon, authenticated;
GRANT ALL ON public.taxonomy TO authenticated;

-- countries
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "countries_public_read" ON public.countries;
CREATE POLICY "countries_public_read" ON public.countries
  FOR SELECT USING (true);
GRANT SELECT ON public.countries TO anon, authenticated;

-- states
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "states_public_read" ON public.states;
CREATE POLICY "states_public_read" ON public.states
  FOR SELECT USING (true);
GRANT SELECT ON public.states TO anon, authenticated;

-- cities
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cities_public_read" ON public.cities;
CREATE POLICY "cities_public_read" ON public.cities
  FOR SELECT USING (true);
GRANT SELECT ON public.cities TO anon, authenticated;

-- platform_settings (public read for non-sensitive settings)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "platform_settings_public_read" ON public.platform_settings;
CREATE POLICY "platform_settings_public_read" ON public.platform_settings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "platform_settings_admin_write" ON public.platform_settings;
CREATE POLICY "platform_settings_admin_write" ON public.platform_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin'))
  );
GRANT SELECT ON public.platform_settings TO anon, authenticated;
GRANT ALL ON public.platform_settings TO authenticated;

-- listings (public marketplace browse)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "listings_public_read" ON public.listings;
CREATE POLICY "listings_public_read" ON public.listings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "listings_owner_write" ON public.listings;
CREATE POLICY "listings_owner_write" ON public.listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.seller_profiles sp 
      WHERE sp.id = listings.seller_profile_id AND sp.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin', 'moderator')
    )
  );
GRANT SELECT ON public.listings TO anon, authenticated;
GRANT ALL ON public.listings TO authenticated;

-- banners (already has policies, just need grants)
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT ALL ON public.banners TO authenticated;

-- profiles (public read for seller cards, user info)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.role::text IN ('admin', 'super_admin', 'superadmin'))
  );
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- ─── 3. AUTHENTICATED-READ TABLES (require login) ───

-- seller_profiles
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seller_profiles_public_read" ON public.seller_profiles;
CREATE POLICY "seller_profiles_public_read" ON public.seller_profiles
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "seller_profiles_own_write" ON public.seller_profiles;
CREATE POLICY "seller_profiles_own_write" ON public.seller_profiles
  FOR ALL USING (profile_id = auth.uid());
GRANT SELECT ON public.seller_profiles TO anon, authenticated;
GRANT ALL ON public.seller_profiles TO authenticated;

-- buyer_profiles
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "buyer_profiles_own_read" ON public.buyer_profiles;
CREATE POLICY "buyer_profiles_own_read" ON public.buyer_profiles
  FOR SELECT USING (profile_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin')
  ));
DROP POLICY IF EXISTS "buyer_profiles_own_write" ON public.buyer_profiles;
CREATE POLICY "buyer_profiles_own_write" ON public.buyer_profiles
  FOR ALL USING (profile_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON public.buyer_profiles TO authenticated;

-- companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "companies_public_read" ON public.companies;
CREATE POLICY "companies_public_read" ON public.companies
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "companies_owner_write" ON public.companies;
CREATE POLICY "companies_owner_write" ON public.companies
  FOR ALL USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin')
  ));
GRANT SELECT ON public.companies TO anon, authenticated;
GRANT ALL ON public.companies TO authenticated;

-- rfqs (authenticated read for buyers/sellers)
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rfqs_own_read" ON public.rfqs;
CREATE POLICY "rfqs_own_read" ON public.rfqs
  FOR SELECT USING (buyer_profile_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin', 'moderator', 'seller')
  ));
DROP POLICY IF EXISTS "rfqs_buyer_create" ON public.rfqs;
CREATE POLICY "rfqs_buyer_create" ON public.rfqs
  FOR INSERT WITH CHECK (buyer_profile_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON public.rfqs TO authenticated;

-- quotes
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quotes_own_read" ON public.quotes;
CREATE POLICY "quotes_own_read" ON public.quotes
  FOR SELECT USING (
    seller_profile_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.rfqs WHERE id = quotes.rfq_id AND buyer_profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin'))
  );
DROP POLICY IF EXISTS "quotes_seller_write" ON public.quotes;
CREATE POLICY "quotes_seller_write" ON public.quotes
  FOR ALL USING (seller_profile_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON public.quotes TO authenticated;

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (profile_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;

-- listing_media
ALTER TABLE public.listing_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "listing_media_public_read" ON public.listing_media;
CREATE POLICY "listing_media_public_read" ON public.listing_media
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "listing_media_owner_write" ON public.listing_media;
CREATE POLICY "listing_media_owner_write" ON public.listing_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings l 
      JOIN public.seller_profiles sp ON l.seller_profile_id = sp.id 
      WHERE l.id = listing_media.listing_id AND sp.profile_id = auth.uid()
    )
  );
GRANT SELECT ON public.listing_media TO anon, authenticated;
GRANT ALL ON public.listing_media TO authenticated;

-- message_threads & messages
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "threads_participant" ON public.message_threads;
CREATE POLICY "threads_participant" ON public.message_threads
  FOR ALL USING (buyer_profile_id = auth.uid() OR seller_profile_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON public.message_threads TO authenticated;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_thread_participant" ON public.messages;
CREATE POLICY "messages_thread_participant" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.message_threads t 
      WHERE t.id = messages.thread_id AND (t.buyer_profile_id = auth.uid() OR t.seller_profile_id = auth.uid())
    )
  );
GRANT SELECT, INSERT ON public.messages TO authenticated;

-- ─── 4. ADMIN/OPS TABLES (already have RLS from migration 0005) ───
GRANT SELECT ON public.permissions TO anon, authenticated;
GRANT SELECT ON public.role_permissions TO anon, authenticated;
GRANT ALL ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_sessions TO authenticated;
GRANT ALL ON public.otp_verifications TO authenticated;
GRANT ALL ON public.rate_limits TO authenticated;
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.company_settings TO authenticated;
GRANT ALL ON public.uploads TO authenticated;
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.lead_activities TO authenticated;
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.memberships TO authenticated;
GRANT ALL ON public.listing_specifications TO authenticated;
GRANT ALL ON public.listing_pricing_tiers TO authenticated;
GRANT ALL ON public.auth_providers TO authenticated;
GRANT ALL ON public.verification_documents TO authenticated;
GRANT ALL ON public.onboarding_sessions TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;
GRANT ALL ON public.email_logs TO authenticated;

-- ─── 5. Trust/supplier tables ───
GRANT SELECT ON public.trust_tiers TO anon, authenticated;
GRANT SELECT ON public.supplier_trust_scores TO authenticated;
GRANT ALL ON public.supplier_activity_events TO authenticated;
GRANT ALL ON public.supplier_response_metrics TO authenticated;
GRANT SELECT ON public.profile_completion TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ RLS policies and grants applied. Public marketplace access restored.'; END $$;
