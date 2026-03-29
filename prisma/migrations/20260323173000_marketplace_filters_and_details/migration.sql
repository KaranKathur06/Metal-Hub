ALTER TABLE "inquiries"
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "budget_range" TEXT,
  ADD COLUMN IF NOT EXISTS "urgency" TEXT NOT NULL DEFAULT 'MEDIUM';

UPDATE "inquiries"
SET "category" = COALESCE("category", 'casting');

ALTER TABLE "inquiries"
  ALTER COLUMN "category" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "inquiries_category_idx" ON "inquiries" ("category");
CREATE INDEX IF NOT EXISTS "inquiries_location_created_at_idx" ON "inquiries" ("location", "created_at" DESC);

ALTER TABLE "suppliers"
  ADD COLUMN IF NOT EXISTS "rating" DECIMAL(2,1) NOT NULL DEFAULT 4.2;

ALTER TABLE "supplier_products"
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "production_capacity" TEXT;

UPDATE "supplier_products"
SET "category" = COALESCE("category", 'casting'),
    "production_capacity" = COALESCE("production_capacity", '1,000 units / month');

ALTER TABLE "supplier_products"
  ALTER COLUMN "category" SET NOT NULL,
  ALTER COLUMN "production_capacity" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "supplier_products_category_idx" ON "supplier_products" ("category");
CREATE INDEX IF NOT EXISTS "supplier_products_supplier_category_idx" ON "supplier_products" ("supplier_id", "category");
CREATE INDEX IF NOT EXISTS "suppliers_verified_location_idx" ON "suppliers" ("is_verified", "location");
