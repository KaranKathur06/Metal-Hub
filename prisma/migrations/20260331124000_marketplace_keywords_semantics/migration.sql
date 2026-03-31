-- Add semantic search layers for supplier products and buyer inquiries.
ALTER TABLE "supplier_products"
  ADD COLUMN IF NOT EXISTS "industries" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "applications" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "inquiries"
  ADD COLUMN IF NOT EXISTS "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "applications" TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE INDEX IF NOT EXISTS "idx_supplier_products_keywords_gin"
  ON "supplier_products" USING GIN ("keywords");

CREATE INDEX IF NOT EXISTS "idx_supplier_products_industries_gin"
  ON "supplier_products" USING GIN ("industries");

CREATE INDEX IF NOT EXISTS "idx_supplier_products_applications_gin"
  ON "supplier_products" USING GIN ("applications");

CREATE INDEX IF NOT EXISTS "idx_inquiries_keywords_gin"
  ON "inquiries" USING GIN ("keywords");

CREATE INDEX IF NOT EXISTS "idx_inquiries_applications_gin"
  ON "inquiries" USING GIN ("applications");
