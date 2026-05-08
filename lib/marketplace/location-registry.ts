import type { SupabaseClient } from "@supabase/supabase-js";

export type CountryOption = {
  id: string;
  name: string;
  iso2?: string | null;
  iso3?: string | null;
  phoneCode?: string | null;
};

export type StateOption = {
  id: string;
  countryId: string;
  name: string;
  stateCode?: string | null;
};

export type CityOption = {
  id: string;
  countryId: string;
  stateId: string;
  name: string;
};

type CountryRecord = {
  id: string;
  name: string;
  iso2: string | null;
  iso3: string | null;
  phone_code: string | null;
};

type StateRecord = {
  id: string;
  country_id: string;
  name: string;
  state_code: string | null;
};

type CityRecord = {
  id: string;
  country_id: string;
  state_id: string;
  name: string;
};

const countryCache = new Map<string, CountryOption[]>();
const stateCache = new Map<string, StateOption[]>();
const cityCache = new Map<string, CityOption[]>();

function normalizeQuery(query?: string) {
  return query?.trim().toLowerCase() ?? "";
}

function filterByQuery<T extends { name: string }>(items: T[], query?: string) {
  const normalized = normalizeQuery(query);

  if (!normalized) {
    return items;
  }

  return items.filter((item) => item.name.toLowerCase().includes(normalized));
}

export async function fetchCountries(supabase: SupabaseClient, query?: string) {
  const cacheKey = "active";

  if (!countryCache.has(cacheKey)) {
    const { data, error } = await supabase
      .from("countries")
      .select("id,name,iso2,iso3,phone_code")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    countryCache.set(
      cacheKey,
      ((data ?? []) as CountryRecord[]).map((country) => ({
        id: country.id,
        name: country.name,
        iso2: country.iso2,
        iso3: country.iso3,
        phoneCode: country.phone_code,
      })),
    );
  }

  return filterByQuery(countryCache.get(cacheKey) ?? [], query);
}

export async function fetchStatesByCountry(supabase: SupabaseClient, countryId: string, query?: string) {
  if (!stateCache.has(countryId)) {
    const { data, error } = await supabase
      .from("states")
      .select("id,country_id,name,state_code")
      .eq("country_id", countryId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    stateCache.set(
      countryId,
      ((data ?? []) as StateRecord[]).map((state) => ({
        id: state.id,
        countryId: state.country_id,
        name: state.name,
        stateCode: state.state_code,
      })),
    );
  }

  return filterByQuery(stateCache.get(countryId) ?? [], query);
}

export async function fetchCitiesByState(supabase: SupabaseClient, stateId: string, query?: string) {
  if (!cityCache.has(stateId)) {
    const { data, error } = await supabase
      .from("cities")
      .select("id,country_id,state_id,name")
      .eq("state_id", stateId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    cityCache.set(
      stateId,
      ((data ?? []) as CityRecord[]).map((city) => ({
        id: city.id,
        countryId: city.country_id,
        stateId: city.state_id,
        name: city.name,
      })),
    );
  }

  return filterByQuery(cityCache.get(stateId) ?? [], query);
}

export function clearLocationRegistryCache() {
  countryCache.clear();
  stateCache.clear();
  cityCache.clear();
}

