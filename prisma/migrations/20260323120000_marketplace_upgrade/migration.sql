CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "banners" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "subtitle" TEXT NOT NULL,
  "image_url" TEXT NOT NULL,
  "cta_text" TEXT NOT NULL,
  "cta_link" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "capabilities" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "image_url" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "hero_image_url" TEXT,
  "hero_title" TEXT,
  "hero_subtitle" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "inquiries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "capability_id" UUID REFERENCES "capabilities"("id") ON DELETE SET NULL,
  "product_name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" TEXT NOT NULL,
  "budget" DECIMAL(12,2),
  "location" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "suppliers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID UNIQUE REFERENCES "users"("id") ON DELETE SET NULL,
  "company_name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "is_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "supplier_products" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "supplier_id" UUID NOT NULL REFERENCES "suppliers"("id") ON DELETE CASCADE,
  "capability_id" UUID REFERENCES "capabilities"("id") ON DELETE SET NULL,
  "product_name" TEXT NOT NULL,
  "price_range" TEXT NOT NULL,
  "moq" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "banners_active_order_idx" ON "banners" ("is_active", "order_index");
CREATE INDEX IF NOT EXISTS "capabilities_active_order_idx" ON "capabilities" ("is_active", "order_index");
CREATE INDEX IF NOT EXISTS "inquiries_user_idx" ON "inquiries" ("user_id");
CREATE INDEX IF NOT EXISTS "inquiries_capability_idx" ON "inquiries" ("capability_id");
CREATE INDEX IF NOT EXISTS "inquiries_location_idx" ON "inquiries" ("location");
CREATE INDEX IF NOT EXISTS "inquiries_status_idx" ON "inquiries" ("status");
CREATE INDEX IF NOT EXISTS "inquiries_created_at_idx" ON "inquiries" ("created_at");
CREATE INDEX IF NOT EXISTS "suppliers_verified_idx" ON "suppliers" ("is_verified");
CREATE INDEX IF NOT EXISTS "suppliers_location_idx" ON "suppliers" ("location");
CREATE INDEX IF NOT EXISTS "suppliers_created_at_idx" ON "suppliers" ("created_at");
CREATE INDEX IF NOT EXISTS "supplier_products_supplier_idx" ON "supplier_products" ("supplier_id");
CREATE INDEX IF NOT EXISTS "supplier_products_capability_idx" ON "supplier_products" ("capability_id");
CREATE INDEX IF NOT EXISTS "supplier_products_created_at_idx" ON "supplier_products" ("created_at");

INSERT INTO "capabilities" ("name", "slug", "image_url", "description", "hero_title", "hero_subtitle", "order_index")
VALUES
  ('Casting', 'casting', '/steel.avif', 'Precision cast components for industrial and automotive use.', 'Industrial Casting Solutions', 'Source precision cast parts from verified foundries.', 1),
  ('Forging', 'forging', '/iron.jpg', 'High-strength forged parts for demanding operating conditions.', 'Forging for Strength', 'Connect with forging partners for mission-critical components.', 2),
  ('Fabrication', 'fabrication', '/Stainless Steel.webp', 'Custom sheet, structure, and heavy fabrication services.', 'Smart Fabrication Network', 'Discover fabrication partners for custom builds and assemblies.', 3),
  ('Machining', 'machining', '/Aluminium.jpg', 'CNC and precision machining for tight-tolerance components.', 'Precision Machining Marketplace', 'Find CNC and precision machining suppliers across India.', 4),
  ('Wire Drawing', 'wire-drawing', '/Copper.jpg', 'Industrial wire drawing services for multiple metal grades.', 'Wire Drawing Expertise', 'Get connected to wire drawing specialists for quality output.', 5)
ON CONFLICT ("slug") DO NOTHING;
