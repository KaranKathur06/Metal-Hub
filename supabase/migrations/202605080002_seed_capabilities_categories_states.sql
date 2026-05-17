-- ══════════════════════════════════════════════
-- SEED: Capabilities (Manufacturing Processes)
-- ══════════════════════════════════════════════

insert into public.taxonomy (name, slug, type, icon, description, sort_order)
values
  ('Casting', 'casting', 'capability', 'Factory', 'Sand casting, die casting, investment casting, and precision cast components.', 10),
  ('Forging', 'forging', 'capability', 'Wrench', 'Open die forging, closed die forging, and high-strength forged parts.', 20),
  ('CNC Machining', 'cnc-machining', 'capability', 'Cog', 'CNC turning, milling, grinding, and precision machining services.', 30),
  ('Fabrication', 'fabrication', 'capability', 'Building2', 'Custom sheet metal, structural, and industrial fabrication services.', 40),
  ('Extrusion', 'extrusion', 'capability', 'GitBranch', 'Aluminum extrusion, plastic extrusion, and custom profile manufacturing.', 50),
  ('Heat Treatment', 'heat-treatment', 'capability', 'Zap', 'Annealing, hardening, tempering, carburizing, and surface hardening.', 60),
  ('Surface Finishing', 'surface-finishing', 'capability', 'ShieldCheck', 'Plating, coating, painting, anodizing, and surface treatment services.', 70),
  ('Assembly', 'assembly', 'capability', 'Package', 'Sub-assembly, final assembly, and turnkey manufacturing solutions.', 80),
  ('Precision Engineering', 'precision-engineering', 'capability', 'Cog', 'Tight tolerance machining, gauge making, and precision components.', 90),
  ('Sheet Metal', 'sheet-metal', 'capability', 'Building2', 'Laser cutting, bending, punching, and sheet metal fabrication.', 100),
  ('Welding', 'welding', 'capability', 'Zap', 'MIG, TIG, arc, spot welding, and certified welding services.', 110),
  ('Wire Drawing', 'wire-drawing', 'capability', 'GitBranch', 'Industrial wire drawing for diverse metal grades and specifications.', 120)
on conflict (slug) do update
set name = excluded.name,
    type = excluded.type,
    icon = excluded.icon,
    description = excluded.description,
    sort_order = excluded.sort_order,
    updated_at = now();

-- ══════════════════════════════════════════════
-- SEED: Product Categories
-- ══════════════════════════════════════════════

insert into public.taxonomy (name, slug, type, icon, description, sort_order)
values
  ('Raw Materials', 'raw-materials', 'category', 'Package', 'Billets, ingots, bars, and raw metal stock for industrial manufacturing.', 10),
  ('Steel Products', 'steel-products', 'category', 'Factory', 'Structural steel, stainless steel, tool steel, and specialty alloys.', 20),
  ('Aluminum Products', 'aluminum-products', 'category', 'Building2', 'Aluminum sheets, profiles, extrusions, and lightweight alloy products.', 30),
  ('Pipes & Tubes', 'pipes-tubes', 'category', 'GitBranch', 'Seamless pipes, welded tubes, ERW pipes, and tubular products.', 40),
  ('Fasteners', 'fasteners', 'category', 'Wrench', 'Bolts, nuts, screws, washers, and industrial fastening systems.', 50),
  ('Industrial Components', 'industrial-components', 'category', 'Cog', 'Gears, shafts, bearings, bushings, and precision components.', 60),
  ('Fabricated Parts', 'fabricated-parts', 'category', 'Building2', 'Custom fabricated assemblies, weldments, and structural parts.', 70),
  ('Castings', 'castings', 'category', 'Factory', 'Sand castings, die castings, investment castings, and precision castings.', 80),
  ('Forgings', 'forgings', 'category', 'Wrench', 'Open die forgings, closed die forgings, and custom forged components.', 90),
  ('Industrial Machinery', 'industrial-machinery-products', 'category', 'Truck', 'CNC machines, presses, lathes, and manufacturing equipment.', 100),
  ('Electrical Components', 'electrical-components', 'category', 'Zap', 'Transformers, panels, connectors, and electrical infrastructure.', 110),
  ('Safety Equipment', 'safety-equipment', 'category', 'ShieldCheck', 'PPE, safety systems, fire protection, and industrial safety gear.', 120)
on conflict (slug) do update
set name = excluded.name,
    type = excluded.type,
    icon = excluded.icon,
    description = excluded.description,
    sort_order = excluded.sort_order,
    updated_at = now();

-- ══════════════════════════════════════════════
-- SEED: India States (top industrial states)
-- ══════════════════════════════════════════════

-- Get India's country ID
do $$
declare
  india_id uuid;
begin
  select id into india_id from public.countries where iso2 = 'IN' limit 1;

  if india_id is null then
    raise notice 'India country record not found, skipping states seed.';
    return;
  end if;

  insert into public.states (country_id, name, state_code, sort_order)
  values
    (india_id, 'Maharashtra', 'MH', 10),
    (india_id, 'Gujarat', 'GJ', 20),
    (india_id, 'Tamil Nadu', 'TN', 30),
    (india_id, 'Karnataka', 'KA', 40),
    (india_id, 'Delhi', 'DL', 50),
    (india_id, 'Haryana', 'HR', 60),
    (india_id, 'Rajasthan', 'RJ', 70),
    (india_id, 'Punjab', 'PB', 80),
    (india_id, 'Uttar Pradesh', 'UP', 90),
    (india_id, 'West Bengal', 'WB', 100),
    (india_id, 'Telangana', 'TS', 110),
    (india_id, 'Andhra Pradesh', 'AP', 120),
    (india_id, 'Kerala', 'KL', 130),
    (india_id, 'Madhya Pradesh', 'MP', 140),
    (india_id, 'Chhattisgarh', 'CG', 150),
    (india_id, 'Jharkhand', 'JH', 160),
    (india_id, 'Odisha', 'OR', 170),
    (india_id, 'Bihar', 'BR', 180),
    (india_id, 'Uttarakhand', 'UK', 190),
    (india_id, 'Himachal Pradesh', 'HP', 200),
    (india_id, 'Goa', 'GA', 210),
    (india_id, 'Assam', 'AS', 220),
    (india_id, 'Jammu & Kashmir', 'JK', 230),
    (india_id, 'Puducherry', 'PY', 240),
    (india_id, 'Chandigarh', 'CH', 250),
    (india_id, 'Dadra & Nagar Haveli', 'DN', 260),
    (india_id, 'Daman & Diu', 'DD', 270),
    (india_id, 'Sikkim', 'SK', 280)
  on conflict (country_id, name) do update
  set state_code = excluded.state_code,
      sort_order = excluded.sort_order,
      updated_at = now();
end $$;
