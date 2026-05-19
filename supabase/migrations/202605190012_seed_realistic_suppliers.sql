-- Migration 0012: legacy companies seed (skipped)
-- Marketplace supplier liquidity is provided by scripts/seed-marketplace.ts
-- against public.suppliers + junction tables.

CREATE OR REPLACE FUNCTION public.get_city_id(p_city_name TEXT, p_state_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_city_id UUID;
BEGIN
  SELECT c.id INTO v_city_id
  FROM public.cities c
  INNER JOIN public.states s ON c.state_id = s.id
  INNER JOIN public.countries cnt ON s.country_id = cnt.id
  WHERE c.name = p_city_name
    AND s.state_code = p_state_code
    AND cnt.iso2 = 'IN'
  LIMIT 1;

  RETURN v_city_id;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  RAISE NOTICE 'Migration 0012 skipped - use npm run seed:marketplace for supplier data.';
END $$;
