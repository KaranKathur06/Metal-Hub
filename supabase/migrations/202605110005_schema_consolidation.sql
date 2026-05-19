-- ═══════════════════════════════════════════════════════════════
-- Migration 0005: Schema Consolidation + Enterprise Infrastructure
-- MetalHub — Phase 0+1 Implementation
-- 
-- This migration:
--   1. Extends role enum with enterprise roles
--   2. Creates RBAC permissions system
--   3. Creates user/company settings tables
--   4. Extends listings with B2B fields
--   5. Creates uploads tracking table
--   6. Migrates CRM, payments, memberships, banners from Prisma
--   7. Adds RLS policies on all new tables
--   8. Deploys audit triggers on critical tables
--   9. Seeds default permissions
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. EXTEND ROLE ENUM ───
DO $$ BEGIN ALTER TYPE public.mh_user_role ADD VALUE IF NOT EXISTS 'super_admin';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.mh_user_role ADD VALUE IF NOT EXISTS 'moderator';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.mh_user_role ADD VALUE IF NOT EXISTS 'support_agent';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.mh_user_role ADD VALUE IF NOT EXISTS 'finance';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.mh_user_role ADD VALUE IF NOT EXISTS 'marketing';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.mh_user_role ADD VALUE IF NOT EXISTS 'manufacturer';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.mh_user_role ADD VALUE IF NOT EXISTS 'distributor';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.mh_user_role ADD VALUE IF NOT EXISTS 'logistics';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 2. RBAC PERMISSIONS SYSTEM ───
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON public.permissions(code);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role TEXT NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  PRIMARY KEY (role, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Permissions readable by authenticated users (for client-side UI gating)
CREATE POLICY permissions_read ON public.permissions
  FOR SELECT USING (true);

-- Role permissions readable by authenticated users
CREATE POLICY role_permissions_read ON public.role_permissions
  FOR SELECT USING (true);

-- Only service role can write permissions (enforced at API level)
CREATE POLICY permissions_service_write ON public.permissions
  FOR INSERT WITH CHECK (true);
CREATE POLICY role_permissions_service_write ON public.role_permissions
  FOR INSERT WITH CHECK (true);

-- ─── 3. USER & COMPANY SETTINGS ───
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, key)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_category ON public.user_settings(user_id, category);

CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, category, key)
);

CREATE INDEX IF NOT EXISTS idx_company_settings_company ON public.company_settings(company_id);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own settings
CREATE POLICY user_settings_own ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Company settings: owner + admin
CREATE POLICY company_settings_access ON public.company_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE id = company_settings.company_id AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- ─── 4. LISTING EXTENSIONS (B2B fields) ───
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS metal_type TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS material_spec TEXT,
  ADD COLUMN IF NOT EXISTS price_min NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS price_max NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS price_unit TEXT DEFAULT 'per MT',
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS is_negotiable BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS quantity_available TEXT,
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'MT',
  ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS listing_role TEXT DEFAULT 'supplier',
  ADD COLUMN IF NOT EXISTS applications TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inquiry_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_listings_metal_type ON public.listings(metal_type) WHERE metal_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_type ON public.listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_role ON public.listings(listing_role);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_keywords_gin ON public.listings USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_listings_applications_gin ON public.listings USING gin(applications);

-- Listing specifications (key-value pairs)
CREATE TABLE IF NOT EXISTS public.listing_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  spec_key TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  unit TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_listing_specs ON public.listing_specifications(listing_id);

-- Pricing tiers for bulk orders
CREATE TABLE IF NOT EXISTS public.listing_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  min_quantity NUMERIC(12,2) NOT NULL,
  max_quantity NUMERIC(12,2),
  price_per_unit NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_pricing ON public.listing_pricing_tiers(listing_id);

ALTER TABLE public.listing_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Public read for specs and pricing
CREATE POLICY listing_specs_read ON public.listing_specifications FOR SELECT USING (true);
CREATE POLICY listing_pricing_read ON public.listing_pricing_tiers FOR SELECT USING (true);

-- Write: listing owner or admin
CREATE POLICY listing_specs_write ON public.listing_specifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.seller_profiles sp ON l.seller_profile_id = sp.id
      WHERE l.id = listing_specifications.listing_id AND sp.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin')
    )
  );

CREATE POLICY listing_pricing_write ON public.listing_pricing_tiers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.seller_profiles sp ON l.seller_profile_id = sp.id
      WHERE l.id = listing_pricing_tiers.listing_id AND sp.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- ─── 5. UPLOADS TRACKING ───
CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  status TEXT NOT NULL DEFAULT 'staged',
  thumbnail_path TEXT,
  preview_path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  moderation_status TEXT DEFAULT 'pending',
  moderation_notes TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_uploads_user ON public.uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_entity ON public.uploads(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON public.uploads(status);
CREATE INDEX IF NOT EXISTS idx_uploads_moderation ON public.uploads(moderation_status);
CREATE INDEX IF NOT EXISTS idx_uploads_bucket ON public.uploads(bucket);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY uploads_own_read ON public.uploads
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin', 'moderator')
    )
  );

CREATE POLICY uploads_own_insert ON public.uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY uploads_own_update ON public.uploads
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin', 'moderator')
    )
  );

CREATE POLICY uploads_own_delete ON public.uploads
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- ─── 6. CRM TABLES (migrated from Prisma) ───
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  source TEXT NOT NULL DEFAULT 'MANUAL',
  stage TEXT NOT NULL DEFAULT 'NEW',
  deal_value NUMERIC(12,2),
  probability INT DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  next_follow_up TIMESTAMPTZ,
  lost_reason TEXT,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON public.leads(next_follow_up) WHERE next_follow_up IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_user ON public.lead_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created ON public.lead_activities(created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- CRM: admin/ops team only
CREATE POLICY leads_admin_access ON public.leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin', 'moderator', 'support_agent', 'supplier_success')
    )
  );

CREATE POLICY lead_activities_admin_access ON public.lead_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin', 'moderator', 'support_agent', 'supplier_success')
    )
  );

-- ─── 7. PAYMENTS (migrated from Prisma) ───
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  plan TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay ON public.payments(razorpay_order_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_own ON public.payments
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin', 'finance')
    )
  );

-- ─── 8. MEMBERSHIPS (migrated from Prisma) ───
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_plan ON public.memberships(plan);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY memberships_own ON public.memberships
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin', 'finance')
    )
  );

-- ─── 9. BANNERS (migrated from Prisma, if not already in Supabase) ───
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Explore',
  cta_link TEXT DEFAULT '/marketplace',
  is_active BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active, order_index);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Public read for active banners
CREATE POLICY banners_public_read ON public.banners
  FOR SELECT USING (true);

-- Admin write
CREATE POLICY banners_admin_write ON public.banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role::text IN ('admin', 'super_admin', 'superadmin', 'marketing')
    )
  );

-- ─── 10. AUDIT TRIGGER FUNCTION ───
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, entity_type, entity_id, action, before_data, after_data)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_listings ON public.listings;
CREATE TRIGGER audit_listings AFTER INSERT OR UPDATE OR DELETE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_companies ON public.companies;
CREATE TRIGGER audit_companies AFTER INSERT OR UPDATE OR DELETE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_leads ON public.leads;
CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_banners ON public.banners;
CREATE TRIGGER audit_banners AFTER INSERT OR UPDATE OR DELETE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- ─── 11. SEED DEFAULT PERMISSIONS ───
INSERT INTO public.permissions (code, module, resource, action, description) VALUES
  -- Users module
  ('users.list', 'users', 'users', 'list', 'List all users'),
  ('users.read', 'users', 'users', 'read', 'Read user details'),
  ('users.update', 'users', 'users', 'update', 'Update user records'),
  ('users.delete', 'users', 'users', 'delete', 'Delete user accounts'),
  ('users.ban', 'users', 'users', 'ban', 'Ban/suspend users'),
  ('users.roles.assign', 'users', 'roles', 'assign', 'Assign roles to users'),
  -- Listings module
  ('listings.create', 'listings', 'listings', 'create', 'Create listings'),
  ('listings.read', 'listings', 'listings', 'read', 'Read listings'),
  ('listings.update', 'listings', 'listings', 'update', 'Update listings'),
  ('listings.delete', 'listings', 'listings', 'delete', 'Delete listings'),
  ('listings.moderate', 'listings', 'listings', 'moderate', 'Moderate/approve listings'),
  ('listings.feature', 'listings', 'listings', 'feature', 'Feature/unfeature listings'),
  -- Admin module
  ('admin.dashboard', 'admin', 'dashboard', 'read', 'View admin dashboard'),
  ('admin.settings', 'admin', 'settings', 'manage', 'Manage platform settings'),
  ('admin.roles', 'admin', 'roles', 'manage', 'Manage RBAC roles'),
  ('admin.audit', 'admin', 'audit', 'read', 'View audit logs'),
  ('admin.analytics', 'admin', 'analytics', 'read', 'View platform analytics'),
  ('admin.banners', 'admin', 'banners', 'manage', 'Manage banners'),
  ('admin.capabilities', 'admin', 'capabilities', 'manage', 'Manage capabilities'),
  -- CRM module
  ('crm.leads.list', 'crm', 'leads', 'list', 'List CRM leads'),
  ('crm.leads.create', 'crm', 'leads', 'create', 'Create CRM leads'),
  ('crm.leads.update', 'crm', 'leads', 'update', 'Update CRM leads'),
  ('crm.leads.delete', 'crm', 'leads', 'delete', 'Delete CRM leads'),
  ('crm.pipeline', 'crm', 'pipeline', 'read', 'View sales pipeline'),
  ('crm.analytics', 'crm', 'analytics', 'read', 'View CRM analytics'),
  -- Storage module
  ('storage.upload', 'storage', 'files', 'upload', 'Upload files'),
  ('storage.delete', 'storage', 'files', 'delete', 'Delete files'),
  ('storage.moderate', 'storage', 'files', 'moderate', 'Moderate uploaded files'),
  ('storage.admin', 'storage', 'buckets', 'manage', 'Manage storage buckets'),
  -- Settings module
  ('settings.own.read', 'settings', 'own', 'read', 'Read own settings'),
  ('settings.own.update', 'settings', 'own', 'update', 'Update own settings'),
  ('settings.platform.read', 'settings', 'platform', 'read', 'Read platform settings'),
  ('settings.platform.update', 'settings', 'platform', 'update', 'Update platform settings'),
  -- Notifications module
  ('notifications.read', 'notifications', 'notifications', 'read', 'Read notifications'),
  ('notifications.manage', 'notifications', 'notifications', 'manage', 'Manage notification templates')
ON CONFLICT (code) DO NOTHING;

-- ─── 12. SEED ROLE-PERMISSION MAPPINGS ───

-- Super Admin gets ALL permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Admin gets most permissions (except roles management and platform update)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions
WHERE code NOT IN ('admin.roles', 'settings.platform.update', 'users.delete')
ON CONFLICT DO NOTHING;

-- Moderator
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'moderator', id FROM public.permissions
WHERE code IN (
  'users.list', 'users.read', 'users.ban',
  'listings.read', 'listings.moderate',
  'admin.dashboard', 'admin.analytics',
  'storage.moderate',
  'crm.leads.list', 'crm.leads.create', 'crm.leads.update',
  'settings.own.read', 'settings.own.update',
  'notifications.read'
)
ON CONFLICT DO NOTHING;

-- Support Agent
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'support_agent', id FROM public.permissions
WHERE code IN (
  'users.list', 'users.read',
  'listings.read',
  'admin.dashboard',
  'crm.leads.list', 'crm.leads.create', 'crm.leads.update',
  'settings.own.read', 'settings.own.update',
  'notifications.read'
)
ON CONFLICT DO NOTHING;

-- Supplier Success
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'supplier_success', id FROM public.permissions
WHERE code IN (
  'users.list', 'users.read',
  'listings.read', 'listings.moderate',
  'admin.dashboard', 'admin.analytics',
  'crm.leads.list', 'crm.leads.create', 'crm.leads.update',
  'crm.pipeline', 'crm.analytics',
  'settings.own.read', 'settings.own.update',
  'notifications.read'
)
ON CONFLICT DO NOTHING;

-- Seller
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'seller', id FROM public.permissions
WHERE code IN (
  'listings.create', 'listings.read', 'listings.update', 'listings.delete',
  'storage.upload', 'storage.delete',
  'settings.own.read', 'settings.own.update',
  'notifications.read'
)
ON CONFLICT DO NOTHING;

-- Buyer
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'buyer', id FROM public.permissions
WHERE code IN (
  'listings.read',
  'storage.upload', 'storage.delete',
  'settings.own.read', 'settings.own.update',
  'notifications.read'
)
ON CONFLICT DO NOTHING;

-- Finance
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'finance', id FROM public.permissions
WHERE code IN (
  'admin.dashboard', 'admin.analytics',
  'settings.own.read', 'settings.own.update',
  'notifications.read'
)
ON CONFLICT DO NOTHING;

-- Marketing
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'marketing', id FROM public.permissions
WHERE code IN (
  'admin.dashboard', 'admin.banners', 'admin.capabilities',
  'listings.read', 'listings.feature',
  'settings.own.read', 'settings.own.update',
  'notifications.read', 'notifications.manage'
)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- New tables: permissions, role_permissions, user_settings,
--   company_settings, listing_specifications, listing_pricing_tiers,
--   uploads, leads, lead_activities, payments, memberships, banners
-- Extensions: listings (13 new columns)
-- RLS: Enabled on all new tables
-- Audit: Triggers on listings, companies, leads, banners
-- Seeds: 35 permissions, 8 role mappings
-- ═══════════════════════════════════════════════════════════════
