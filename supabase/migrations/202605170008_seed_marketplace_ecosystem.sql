-- ═══════════════════════════════════════════════════════════════
-- Migration 0008: Industrial Marketplace Seed Data
-- Creates realistic B2B ecosystem: suppliers, listings, RFQs
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. EXTENDED TAXONOMY: Industries per spec ───
INSERT INTO public.taxonomy (name, slug, type, icon, description, sort_order) VALUES
  ('Aerospace', 'aerospace', 'industry', 'Plane', 'Aircraft components, turbine parts, and aerospace-grade manufacturing.', 5),
  ('Consumer Goods', 'consumer-goods', 'industry', 'ShoppingBag', 'Consumer product manufacturing and metal consumer goods.', 15),
  ('Defense', 'defense', 'industry', 'Shield', 'Defense equipment, armored vehicles, and military-grade components.', 25),
  ('Oil & Gas', 'oil-gas', 'industry', 'Fuel', 'Upstream, midstream, and downstream oil and gas equipment.', 35),
  ('Energy', 'energy', 'industry', 'Zap', 'Power generation, transmission, and energy infrastructure.', 45),
  ('Infrastructure', 'infrastructure', 'industry', 'Building2', 'Civil infrastructure, bridges, tunnels, and structural steel.', 55),
  ('Automotive', 'automotive', 'industry', 'Truck', 'Automotive OEM and aftermarket components manufacturing.', 65),
  ('Marine', 'marine', 'industry', 'Anchor', 'Shipbuilding, marine hardware, and offshore structures.', 75),
  ('Electronics', 'electronics', 'industry', 'Cpu', 'Electronic enclosures, connectors, and precision electronics parts.', 85),
  ('Medical', 'medical', 'industry', 'Heart', 'Medical devices, surgical instruments, and implant manufacturing.', 95),
  ('Heavy Engineering', 'heavy-engineering', 'industry', 'Factory', 'Heavy machinery, mining equipment, and large-scale fabrication.', 105),
  ('Construction', 'construction', 'industry', 'Building', 'Construction materials, structural steel, and building systems.', 115),
  ('Railways', 'railways', 'industry', 'Train', 'Railway components, rolling stock, and rail infrastructure.', 125),
  ('Renewables', 'renewables', 'industry', 'Sun', 'Solar, wind, and renewable energy equipment manufacturing.', 135),
  ('Industrial Equipment', 'industrial-equipment', 'industry', 'Cog', 'General industrial machinery and equipment manufacturing.', 145)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order, updated_at=now();

-- ─── 2. EXTENDED CAPABILITIES ───
INSERT INTO public.taxonomy (name, slug, type, icon, description, sort_order) VALUES
  ('Laser Cutting', 'laser-cutting', 'capability', 'Zap', 'Fiber and CO2 laser cutting for precision sheet metal parts.', 125),
  ('Die Casting', 'die-casting', 'capability', 'Factory', 'High-pressure and gravity die casting for aluminum and zinc alloys.', 130),
  ('Powder Coating', 'powder-coating', 'capability', 'Paintbrush', 'Electrostatic powder coating and industrial finishing services.', 135),
  ('Wire Drawing', 'wire-drawing-cap', 'capability', 'GitBranch', 'Industrial wire drawing for diverse metal grades.', 140)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order, updated_at=now();

-- ─── 3. PRODUCT TAXONOMY ───
INSERT INTO public.taxonomy (name, slug, type, icon, description, sort_order) VALUES
  ('Steel', 'steel', 'material', 'Package', 'Carbon steel, mild steel, and structural steel products.', 10),
  ('Iron', 'iron', 'material', 'Package', 'Cast iron, ductile iron, and pig iron products.', 20),
  ('Aluminum', 'aluminum', 'material', 'Package', 'Aluminum alloys, sheets, extrusions, and castings.', 30),
  ('Copper', 'copper', 'material', 'Package', 'Copper cathodes, tubes, bus bars, and conductors.', 40),
  ('Brass', 'brass', 'material', 'Package', 'Brass fittings, rods, sheets, and precision components.', 50),
  ('Stainless Steel', 'stainless-steel', 'material', 'Package', 'SS 304, 316, 316L, 410, 420 grade products.', 60),
  ('Titanium', 'titanium', 'material', 'Package', 'Titanium alloys for aerospace and medical applications.', 70),
  ('Nickel Alloys', 'nickel-alloys', 'material', 'Package', 'Inconel, Monel, Hastelloy, and nickel-base superalloys.', 80),
  ('Carbon Steel', 'carbon-steel', 'material', 'Package', 'Low, medium, and high carbon steel grades.', 90),
  ('Tool Steel', 'tool-steel', 'material', 'Package', 'D2, H13, M2, and specialty tool steel grades.', 100),
  ('Alloy Steel', 'alloy-steel', 'material', 'Package', 'EN8, EN19, EN24, EN36, and chromoly alloy steels.', 110),
  ('Galvanized Steel', 'galvanized-steel', 'material', 'Package', 'Hot-dip and electro-galvanized steel products.', 120),
  ('Inconel', 'inconel', 'material', 'Package', 'Inconel 600, 625, 718 high-temperature alloys.', 130),
  ('Bronze', 'bronze', 'material', 'Package', 'Phosphor bronze, gunmetal, and bearing bronzes.', 140),
  ('Industrial Plastics', 'industrial-plastics', 'material', 'Package', 'Engineering plastics for industrial applications.', 150)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order, updated_at=now();

-- ─── 4. SEED CITIES ───
DO $$
DECLARE
  india_id uuid;
  gj_id uuid; mh_id uuid; tn_id uuid; ka_id uuid; hr_id uuid; pb_id uuid;
BEGIN
  SELECT id INTO india_id FROM public.countries WHERE iso2='IN' LIMIT 1;
  IF india_id IS NULL THEN RETURN; END IF;

  SELECT id INTO gj_id FROM public.states WHERE country_id=india_id AND state_code='GJ' LIMIT 1;
  SELECT id INTO mh_id FROM public.states WHERE country_id=india_id AND state_code='MH' LIMIT 1;
  SELECT id INTO tn_id FROM public.states WHERE country_id=india_id AND state_code='TN' LIMIT 1;
  SELECT id INTO ka_id FROM public.states WHERE country_id=india_id AND state_code='KA' LIMIT 1;
  SELECT id INTO hr_id FROM public.states WHERE country_id=india_id AND state_code='HR' LIMIT 1;
  SELECT id INTO pb_id FROM public.states WHERE country_id=india_id AND state_code='PB' LIMIT 1;

  IF gj_id IS NOT NULL THEN
    INSERT INTO public.cities (country_id, state_id, name, sort_order) VALUES
      (india_id, gj_id, 'Rajkot', 10), (india_id, gj_id, 'Ahmedabad', 20),
      (india_id, gj_id, 'Surat', 30), (india_id, gj_id, 'Vadodara', 40),
      (india_id, gj_id, 'Jamnagar', 50), (india_id, gj_id, 'Bhavnagar', 60)
    ON CONFLICT (state_id, name) DO NOTHING;
  END IF;

  IF mh_id IS NOT NULL THEN
    INSERT INTO public.cities (country_id, state_id, name, sort_order) VALUES
      (india_id, mh_id, 'Pune', 10), (india_id, mh_id, 'Mumbai', 20),
      (india_id, mh_id, 'Nashik', 30), (india_id, mh_id, 'Aurangabad', 40),
      (india_id, mh_id, 'Kolhapur', 50)
    ON CONFLICT (state_id, name) DO NOTHING;
  END IF;

  IF tn_id IS NOT NULL THEN
    INSERT INTO public.cities (country_id, state_id, name, sort_order) VALUES
      (india_id, tn_id, 'Chennai', 10), (india_id, tn_id, 'Coimbatore', 20),
      (india_id, tn_id, 'Madurai', 30), (india_id, tn_id, 'Salem', 40)
    ON CONFLICT (state_id, name) DO NOTHING;
  END IF;

  IF ka_id IS NOT NULL THEN
    INSERT INTO public.cities (country_id, state_id, name, sort_order) VALUES
      (india_id, ka_id, 'Bengaluru', 10), (india_id, ka_id, 'Mysore', 20),
      (india_id, ka_id, 'Hubli', 30)
    ON CONFLICT (state_id, name) DO NOTHING;
  END IF;

  IF hr_id IS NOT NULL THEN
    INSERT INTO public.cities (country_id, state_id, name, sort_order) VALUES
      (india_id, hr_id, 'Faridabad', 10), (india_id, hr_id, 'Gurugram', 20)
    ON CONFLICT (state_id, name) DO NOTHING;
  END IF;

  IF pb_id IS NOT NULL THEN
    INSERT INTO public.cities (country_id, state_id, name, sort_order) VALUES
      (india_id, pb_id, 'Ludhiana', 10), (india_id, pb_id, 'Jalandhar', 20)
    ON CONFLICT (state_id, name) DO NOTHING;
  END IF;
END $$;

-- ─── 5. SEED BANNERS ───
INSERT INTO public.banners (title, subtitle, image_url, cta_text, cta_link, is_active, order_index) VALUES
  ('Source From Verified Metal Suppliers', 'Compare trusted suppliers, request quotes, and close deals faster on MetalHub.', '/hero.png', 'Explore Marketplace', '/marketplace', true, 0),
  ('Post Buyer Requirements In Minutes', 'Reach quality suppliers across India with structured, searchable inquiries.', '/casting.jpg', 'Post Requirement', '/post-requirement', true, 1),
  ('Grow Your Supplier Presence', 'Publish products, get discovered by buyers, and scale B2B orders efficiently.', '/Fabrication.jpg', 'Join as Supplier', '/register', true, 2)
ON CONFLICT DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✅ Extended taxonomy, cities, and banners seeded.'; END $$;
