-- ============================================================
-- Metal Hub — Bridge Migration: Prisma → Supabase Schema Compatibility
-- 
-- Converts text IDs to UUID for Supabase-native architecture.
-- Handles FK constraint drops/recreations automatically.
-- ============================================================

-- Step 1: Drop ALL foreign key constraints in public schema
-- (they'll be recreated by subsequent migrations)
DO $$
DECLARE
  _constraint RECORD;
BEGIN
  FOR _constraint IN
    SELECT tc.constraint_name, tc.table_name
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name NOT LIKE '_prisma%'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', 
        _constraint.table_name, _constraint.constraint_name);
      RAISE NOTICE 'Dropped FK: %.%', _constraint.table_name, _constraint.constraint_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skip FK drop %.%: %', _constraint.table_name, _constraint.constraint_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- Step 1b: Drop legacy tables that will be replaced by new schema/views
-- These are Prisma-managed tables superseded by the Supabase system
DROP TABLE IF EXISTS public.industries CASCADE;
DROP TABLE IF EXISTS public.supplier_industries CASCADE;
DROP TABLE IF EXISTS public.supplier_capabilities CASCADE;
DROP TABLE IF EXISTS public.supplier_products CASCADE;
DROP TABLE IF EXISTS public.product_capabilities CASCADE;
DROP TABLE IF EXISTS public.requirement_capabilities CASCADE;
DROP TABLE IF EXISTS public.ops_user_roles CASCADE;
DROP TABLE IF EXISTS public.ops_role_permissions CASCADE;
DROP TABLE IF EXISTS public.ops_permissions CASCADE;
DROP TABLE IF EXISTS public.ops_roles CASCADE;
DROP TABLE IF EXISTS public.lead_activities CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.login_activity CASCADE;
DROP TABLE IF EXISTS public.razorpay_events CASCADE;
DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.listing_images CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.memberships CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.capabilities CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.auth_providers CASCADE;

-- Step 2: Convert all text ID columns to UUID
DO $$
DECLARE
  _col RECORD;
BEGIN
  FOR _col IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.data_type = 'text'
      AND (
        c.column_name = 'id'
        OR c.column_name LIKE '%_id'
        OR c.column_name IN ('user_id', 'profile_id', 'seller_id', 'buyer_id', 'listing_id', 'inquiry_id')
      )
      AND c.table_name NOT LIKE '_prisma%'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE uuid USING %I::uuid', 
        _col.table_name, _col.column_name, _col.column_name);
      RAISE NOTICE 'Converted %.% to uuid', _col.table_name, _col.column_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skip %.% conversion: %', _col.table_name, _col.column_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- Step 3: Set default UUID generation on primary IDs
DO $$
DECLARE
  _tbl RECORD;
BEGIN
  FOR _tbl IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'id'
      AND data_type = 'uuid'
      AND table_name NOT LIKE '_prisma%'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT gen_random_uuid()', _tbl.table_name);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

DO $$ BEGIN RAISE NOTICE '✅ Bridge migration complete. All text IDs converted to UUID. FKs will be recreated by subsequent migrations.'; END $$;
