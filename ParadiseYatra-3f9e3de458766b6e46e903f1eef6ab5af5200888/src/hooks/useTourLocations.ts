import { useEffect, useState } from "react";

const CACHE_KEY = "paradise_location_cache_v1";
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

export type TourLocations = {
  indiaStates: string[];
  internationalCountries: string[];
};

type CachedLocations = TourLocations & { timestamp: number };

const loadCachedLocations = (): CachedLocations | null => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedLocations;
    if (!parsed.timestamp || Date.now() - parsed.timestamp > CACHE_TTL) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to read location cache:", error);
    return null;
  }
};

const saveCachedLocations = (indiaStates: string[], internationalCountries: string[]) => {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), indiaStates, internationalCountries })
    );
  } catch (error) {
    console.warn("Failed to cache locations:", error);
  }
};

const uniqueSorted = (packages: { state?: string; country?: string }[], field: "state" | "country"): string[] =>
  Array.from(
    new Set(
      packages
        .map((pkg) => pkg[field]?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ).sort();

let inFlight: Promise<TourLocations> | null = null;

/**
 * India states and international countries that have active packages.
 * Cached in sessionStorage; concurrent callers share one request.
 */
export const fetchTourLocations = (): Promise<TourLocations> => {
  const cached = loadCachedLocations();
  if (cached) {
    return Promise.resolve({ indiaStates: cached.indiaStates, internationalCountries: cached.internationalCountries });
  }
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const [indiaResponse, intlResponse] = await Promise.all([
      fetch("/api/all-packages?tourType=india&limit=200&isActive=true&minimal=true", { cache: "no-store" }),
      fetch("/api/all-packages?tourType=international&limit=200&isActive=true&minimal=true", { cache: "no-store" }),
    ]);

    const indiaStates = indiaResponse.ok ? uniqueSorted((await indiaResponse.json()).packages || [], "state") : [];
    const internationalCountries = intlResponse.ok
      ? uniqueSorted((await intlResponse.json()).packages || [], "country")
      : [];

    if (indiaStates.length || internationalCountries.length) {
      saveCachedLocations(indiaStates, internationalCountries);
    }
    return { indiaStates, internationalCountries };
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
};

/**
 * React wrapper around fetchTourLocations.
 * Nothing is fetched until `load()` is called (e.g. when a menu first opens).
 */
export const useTourLocations = () => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [indiaStates, setIndiaStates] = useState<string[]>([]);
  const [internationalCountries, setInternationalCountries] = useState<string[]>([]);

  useEffect(() => {
    if (!shouldFetch || hasFetched) return;

    let isMounted = true;
    fetchTourLocations()
      .then((locations) => {
        if (!isMounted) return;
        setIndiaStates(locations.indiaStates);
        setInternationalCountries(locations.internationalCountries);
      })
      .catch((error) => console.error("Error fetching locations:", error))
      .finally(() => {
        if (isMounted) setHasFetched(true);
      });

    return () => {
      isMounted = false;
    };
  }, [shouldFetch, hasFetched]);

  return {
    indiaStates,
    internationalCountries,
    loading: !hasFetched,
    load: () => setShouldFetch(true),
  };
};
