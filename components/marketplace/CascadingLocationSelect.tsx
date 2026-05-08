"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import {
  fetchCitiesByState,
  fetchCountries,
  fetchStatesByCountry,
  type CityOption,
  type CountryOption,
  type StateOption,
} from "../../lib/marketplace/location-registry";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser-client";

export type CascadingLocationValue = {
  countryId: string | null;
  stateId: string | null;
  cityId: string | null;
};

type CascadingLocationSelectProps = {
  value: CascadingLocationValue;
  onChange: (value: CascadingLocationValue) => void;
  disabled?: boolean;
};

export function CascadingLocationSelect({ value, onChange, disabled }: CascadingLocationSelectProps) {
  const [countryQuery, setCountryQuery] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    setLoadingCountries(true);
    fetchCountries(supabase, countryQuery)
      .then((nextCountries) => {
        if (mounted) {
          setCountries(nextCountries);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingCountries(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [countryQuery]);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !value.countryId) {
      setStates([]);
      return;
    }

    setLoadingStates(true);
    fetchStatesByCountry(supabase, value.countryId, stateQuery)
      .then((nextStates) => {
        if (mounted) {
          setStates(nextStates);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingStates(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [stateQuery, value.countryId]);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !value.stateId) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    fetchCitiesByState(supabase, value.stateId, cityQuery)
      .then((nextCities) => {
        if (mounted) {
          setCities(nextCities);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingCities(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [cityQuery, value.stateId]);

  const selectedCountry = useMemo(
    () => countries.find((country) => country.id === value.countryId) ?? null,
    [countries, value.countryId],
  );
  const selectedState = useMemo(
    () => states.find((state) => state.id === value.stateId) ?? null,
    [states, value.stateId],
  );

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-600">Country</label>
        <div className="rounded-md border border-zinc-300 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
            <input
              className="min-w-0 flex-1 text-sm outline-none"
              value={countryQuery}
              onChange={(event) => setCountryQuery(event.target.value)}
              placeholder="Search country"
              disabled={disabled}
            />
          </div>
          <select
            className="w-full bg-transparent px-3 py-2 text-sm outline-none"
            value={value.countryId ?? ""}
            onChange={(event) => {
              onChange({
                countryId: event.target.value || null,
                stateId: null,
                cityId: null,
              });
              setStateQuery("");
              setCityQuery("");
            }}
            disabled={disabled || loadingCountries}
          >
            <option value="">{loadingCountries ? "Loading countries" : "Select country"}</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-600">State</label>
        <div className="rounded-md border border-zinc-300 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
            <input
              className="min-w-0 flex-1 text-sm outline-none"
              value={stateQuery}
              onChange={(event) => setStateQuery(event.target.value)}
              placeholder={selectedCountry ? "Search state" : "Select country first"}
              disabled={disabled || !value.countryId}
            />
          </div>
          <select
            className="w-full bg-transparent px-3 py-2 text-sm outline-none"
            value={value.stateId ?? ""}
            onChange={(event) => {
              onChange({
                countryId: value.countryId,
                stateId: event.target.value || null,
                cityId: null,
              });
              setCityQuery("");
            }}
            disabled={disabled || !value.countryId || loadingStates}
          >
            <option value="">{loadingStates ? "Loading states" : "Select state"}</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-600">City</label>
        <div className="rounded-md border border-zinc-300 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2">
            <MapPin className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
            <input
              className="min-w-0 flex-1 text-sm outline-none"
              value={cityQuery}
              onChange={(event) => setCityQuery(event.target.value)}
              placeholder={selectedState ? "Search city" : "Select state first"}
              disabled={disabled || !value.stateId}
            />
          </div>
          <select
            className="w-full bg-transparent px-3 py-2 text-sm outline-none"
            value={value.cityId ?? ""}
            onChange={(event) => {
              onChange({
                countryId: value.countryId,
                stateId: value.stateId,
                cityId: event.target.value || null,
              });
            }}
            disabled={disabled || !value.stateId || loadingCities}
          >
            <option value="">{loadingCities ? "Loading cities" : "Select city"}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

