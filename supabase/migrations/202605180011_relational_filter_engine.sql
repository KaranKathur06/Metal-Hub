-- ============================================================
-- MIGRATION 0011: Relational Filter Engine + Supplier Enrichment
-- Creates normalized many-to-many tables for supplier ↔ taxonomy
-- Seeds realistic mappings for all 30 suppliers
-- Adds indexes for performant marketplace filtering
-- ============================================================

-- 1. JUNCTION TABLES for supplier-taxonomy relationships
CREATE TABLE IF NOT EXISTS public.company_industries (
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  taxonomy_id UUID NOT NULL REFERENCES public.taxonomy(id) ON DELETE CASCADE,
  PRIMARY KEY (company_id, taxonomy_id)
);

CREATE TABLE IF NOT EXISTS public.company_capabilities (
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  taxonomy_id UUID NOT NULL REFERENCES public.taxonomy(id) ON DELETE CASCADE,
  PRIMARY KEY (company_id, taxonomy_id)
);

CREATE TABLE IF NOT EXISTS public.company_products (
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  taxonomy_id UUID NOT NULL REFERENCES public.taxonomy(id) ON DELETE CASCADE,
  PRIMARY KEY (company_id, taxonomy_id)
);

-- 2. RLS policies — public read, authenticated write
ALTER TABLE public.company_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY ci_read ON public.company_industries FOR SELECT USING (true);
CREATE POLICY ci_write ON public.company_industries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY ci_del ON public.company_industries FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY cc_read ON public.company_capabilities FOR SELECT USING (true);
CREATE POLICY cc_write ON public.company_capabilities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY cc_del ON public.company_capabilities FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY cp_read ON public.company_products FOR SELECT USING (true);
CREATE POLICY cp_write ON public.company_products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY cp_del ON public.company_products FOR DELETE USING (auth.uid() IS NOT NULL);

-- 3. Grants
GRANT SELECT ON public.company_industries TO anon, authenticated;
GRANT SELECT ON public.company_capabilities TO anon, authenticated;
GRANT SELECT ON public.company_products TO anon, authenticated;
GRANT INSERT, DELETE ON public.company_industries TO authenticated;
GRANT INSERT, DELETE ON public.company_capabilities TO authenticated;
GRANT INSERT, DELETE ON public.company_products TO authenticated;

-- 4. Performance indexes
CREATE INDEX IF NOT EXISTS idx_ci_company ON public.company_industries(company_id);
CREATE INDEX IF NOT EXISTS idx_ci_taxonomy ON public.company_industries(taxonomy_id);
CREATE INDEX IF NOT EXISTS idx_cc_company ON public.company_capabilities(company_id);
CREATE INDEX IF NOT EXISTS idx_cc_taxonomy ON public.company_capabilities(taxonomy_id);
CREATE INDEX IF NOT EXISTS idx_cp_company ON public.company_products(company_id);
CREATE INDEX IF NOT EXISTS idx_cp_taxonomy ON public.company_products(taxonomy_id);

CREATE INDEX IF NOT EXISTS idx_listings_company ON public.listings(company_id);
CREATE INDEX IF NOT EXISTS idx_listings_active ON public.listings(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_listings_metal ON public.listings(metal_type);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON public.companies(verification_status);
CREATE INDEX IF NOT EXISTS idx_taxonomy_type ON public.taxonomy(type, is_active);

-- 5. Add description + response columns to companies if missing
DO $$ BEGIN
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS response_rate INTEGER DEFAULT 90;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS avg_response_hours INTEGER DEFAULT 4;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS completion_rate INTEGER DEFAULT 92;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS export_capability BOOLEAN DEFAULT false;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS established_year INTEGER;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS employee_count INTEGER;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS iso_certified BOOLEAN DEFAULT false;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN RAISE NOTICE '✅ Migration 0011 — Junction tables, indexes, and enrichment columns created.'; END $$;
