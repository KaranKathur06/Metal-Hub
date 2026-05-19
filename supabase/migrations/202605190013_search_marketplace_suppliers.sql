-- Server-side supplier discovery with relational filters, full-text search, and pagination.

create or replace function public.search_marketplace_suppliers(
  search_query text default null,
  capability_slugs text[] default '{}',
  industry_slugs text[] default '{}',
  product_slugs text[] default '{}',
  certification_slugs text[] default '{}',
  city_names text[] default '{}',
  verification_filter text default null,
  include_seeded boolean default true,
  page_number integer default 1,
  page_size integer default 12
)
returns table (
  id uuid,
  company_name text,
  slug text,
  short_description text,
  logo_url text,
  banner_url text,
  city text,
  state text,
  country text,
  verification_status public.verification_status,
  response_rate numeric,
  completion_rate numeric,
  years_in_business integer,
  avg_response_time text,
  export_capability boolean,
  domestic_capability boolean,
  featured_product text,
  featured_material text,
  moq text,
  production_capacity text,
  price_range text,
  recent_activity text,
  is_seeded boolean,
  profile_completeness numeric,
  interaction_count integer,
  supplier_rank_score numeric,
  computed_rank numeric,
  capabilities jsonb,
  industries jsonb,
  products jsonb,
  certifications jsonb,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  normalized_query text;
  ts_query tsquery;
  safe_page integer;
  safe_size integer;
  offset_rows integer;
begin
  normalized_query := nullif(trim(search_query), '');
  safe_page := greatest(coalesce(page_number, 1), 1);
  safe_size := least(greatest(coalesce(page_size, 12), 1), 48);
  offset_rows := (safe_page - 1) * safe_size;

  if normalized_query is not null then
  begin
    ts_query := websearch_to_tsquery('english', normalized_query);
  exception when others then
    ts_query := plainto_tsquery('english', normalized_query);
  end;
  end if;

  return query
  with filtered as (
    select s.*
    from public.suppliers s
    where s.is_published = true
      and (include_seeded or s.is_seeded = false)
      and (
        verification_filter is null
        or verification_filter = ''
        or s.verification_status::text = verification_filter
      )
      and (
        coalesce(array_length(capability_slugs, 1), 0) = 0
        or exists (
          select 1
          from public.supplier_capabilities sc
          join public.capabilities c on c.id = sc.capability_id
          where sc.supplier_id = s.id
            and c.slug = any (capability_slugs)
        )
      )
      and (
        coalesce(array_length(industry_slugs, 1), 0) = 0
        or exists (
          select 1
          from public.supplier_industries si
          join public.industries i on i.id = si.industry_id
          where si.supplier_id = s.id
            and i.slug = any (industry_slugs)
        )
      )
      and (
        coalesce(array_length(product_slugs, 1), 0) = 0
        or exists (
          select 1
          from public.supplier_products sp
          join public.products p on p.id = sp.product_id
          where sp.supplier_id = s.id
            and p.slug = any (product_slugs)
        )
      )
      and (
        coalesce(array_length(certification_slugs, 1), 0) = 0
        or exists (
          select 1
          from public.supplier_certifications scert
          join public.certifications cert on cert.id = scert.certification_id
          where scert.supplier_id = s.id
            and cert.slug = any (certification_slugs)
            and scert.verification_status = 'active'
        )
      )
      and (
        coalesce(array_length(city_names, 1), 0) = 0
        or lower(s.city) = any (
          select lower(unnest(city_names))
        )
        or lower(replace(s.city, ' ', '-')) = any (
          select lower(unnest(city_names))
        )
      )
      and (
        normalized_query is null
        or s.search_document @@ ts_query
        or s.company_name ilike '%' || normalized_query || '%'
        or s.short_description ilike '%' || normalized_query || '%'
        or s.featured_product ilike '%' || normalized_query || '%'
        or s.featured_material ilike '%' || normalized_query || '%'
        or s.city ilike '%' || normalized_query || '%'
      )
  ),
  ranked as (
    select
      f.*,
      count(*) over () as total_count,
      coalesce(f.supplier_rank_score, 0) as computed_rank
    from filtered f
    order by
      case when normalized_query is not null then ts_rank_cd(f.search_document, ts_query) else 0 end desc,
      f.supplier_rank_score desc,
      f.created_at desc
    limit safe_size
    offset offset_rows
  )
  select
    r.id,
    r.company_name,
    r.slug,
    r.short_description,
    r.logo_url,
    r.banner_url,
    r.city,
    r.state,
    r.country,
    r.verification_status,
    r.response_rate,
    r.completion_rate,
    r.years_in_business,
    r.avg_response_time,
    r.export_capability,
    r.domestic_capability,
    r.featured_product,
    r.featured_material,
    r.moq,
    r.production_capacity,
    r.price_range,
    r.recent_activity,
    r.is_seeded,
    r.profile_completeness,
    r.interaction_count,
    r.supplier_rank_score,
    r.computed_rank,
    coalesce((
      select jsonb_agg(jsonb_build_object('name', c.name, 'slug', c.slug) order by c.sort_order, c.name)
      from public.supplier_capabilities sc
      join public.capabilities c on c.id = sc.capability_id
      where sc.supplier_id = r.id
    ), '[]'::jsonb) as capabilities,
    coalesce((
      select jsonb_agg(jsonb_build_object('name', i.name, 'slug', i.slug) order by i.sort_order, i.name)
      from public.supplier_industries si
      join public.industries i on i.id = si.industry_id
      where si.supplier_id = r.id
    ), '[]'::jsonb) as industries,
    coalesce((
      select jsonb_agg(
        jsonb_build_object('name', p.name, 'slug', p.slug, 'family', p.product_family)
        order by p.sort_order, p.name
      )
      from public.supplier_products sp
      join public.products p on p.id = sp.product_id
      where sp.supplier_id = r.id
    ), '[]'::jsonb) as products,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'name', cert.name,
          'slug', cert.slug,
          'status', scert.verification_status,
          'expires_at', scert.expires_at,
          'business_priority', cert.business_priority,
          'global_recognition_level', cert.global_recognition_level
        )
        order by cert.business_priority desc, cert.name
      )
      from public.supplier_certifications scert
      join public.certifications cert on cert.id = scert.certification_id
      where scert.supplier_id = r.id
    ), '[]'::jsonb) as certifications,
    r.total_count
  from ranked r;
end;
$$;

grant execute on function public.search_marketplace_suppliers(
  text, text[], text[], text[], text[], text[], text, boolean, integer, integer
) to anon, authenticated;
