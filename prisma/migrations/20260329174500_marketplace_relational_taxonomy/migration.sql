-- Taxonomy core tables
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID NULL REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Supplier normalization
ALTER TABLE suppliers
  ADD COLUMN IF NOT EXISTS tagline TEXT NULL,
  ADD COLUMN IF NOT EXISTS iso_certified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS export_ready BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS response_time_minutes INTEGER NOT NULL DEFAULT 120,
  ADD COLUMN IF NOT EXISTS completion_rate DOUBLE PRECISION NOT NULL DEFAULT 78;

CREATE TABLE IF NOT EXISTS supplier_capabilities (
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_id, capability_id)
);

CREATE TABLE IF NOT EXISTS supplier_industries (
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_id, industry_id)
);

-- Product normalization
ALTER TABLE supplier_products
  ADD COLUMN IF NOT EXISTS category_id UUID NULL REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD COLUMN IF NOT EXISTS material TEXT NULL;

CREATE TABLE IF NOT EXISTS product_capabilities (
  product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, capability_id)
);

-- Buyer requirement normalization
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS industry_id UUID NULL REFERENCES industries(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD COLUMN IF NOT EXISTS category_id UUID NULL REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD COLUMN IF NOT EXISTS material TEXT NULL,
  ADD COLUMN IF NOT EXISTS spec_doc_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quote_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS requirement_capabilities (
  requirement_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE ON UPDATE CASCADE,
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (requirement_id, capability_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS industries_slug_idx ON industries(slug);
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_id);
CREATE INDEX IF NOT EXISTS supplier_capabilities_capability_id_idx ON supplier_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS supplier_industries_industry_id_idx ON supplier_industries(industry_id);
CREATE INDEX IF NOT EXISTS product_capabilities_capability_id_idx ON product_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS requirement_capabilities_capability_id_idx ON requirement_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS supplier_products_category_id_idx ON supplier_products(category_id);
CREATE INDEX IF NOT EXISTS inquiries_industry_id_idx ON inquiries(industry_id);
CREATE INDEX IF NOT EXISTS inquiries_category_id_idx ON inquiries(category_id);
CREATE INDEX IF NOT EXISTS suppliers_rating_idx ON suppliers(rating DESC);
CREATE INDEX IF NOT EXISTS suppliers_completion_rate_idx ON suppliers(completion_rate DESC);
