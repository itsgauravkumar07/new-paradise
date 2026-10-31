import { useState, useCallback, useMemo } from 'react';
import { Country, State } from 'country-state-city';
import type { ICountry, IState } from 'country-state-city';

interface CountryData {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  phone_code: string;
  capital: string;
  currency: string;
  currency_symbol: string;
  tld: string;
  native: string;
  region: string;
  subregion: string;
  timezones: Array<{
    zoneName: string;
    gmtOffset: number;
    gmtOffsetName: string;
    abbreviation: string;
    tzName: string;
  }>;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
}

interface StateData {
  id: number;
  name: string;
  state_code?: string;
  latitude?: string;
  longitude?: string;
  type?: string;
}

interface UseLocationsReturn {
  countries: CountryData[];
  states: StateData[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filteredCountries: CountryData[];
  setSearchQuery: (query: string) => void;
  fetchStates: (countryIso2: string) => void;
  clearStates: () => void;
  getCountryByIso2: (iso2: string) => CountryData | undefined;
  getStateByCode: (stateCode: string) => StateData | undefined;
}

export const useLocations = (): UseLocationsReturn => {
  const [states, setStates] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get all countries from country-state-city package
  const countries = useMemo(() => {
    try {
      const allCountries = Country.getAllCountries();
      return allCountries.map((country: ICountry, index: number) => ({
        id: index + 1,
        name: country.name,
        iso2: country.isoCode,
        iso3: country.isoCode,
        phone_code: country.phonecode,
        capital: '',
        currency: country.currency || '',
        currency_symbol: '',
        tld: '',
        native: country.name,
        region: '',
        subregion: '',
        timezones: country.timezones?.map((tz: any) => ({
          zoneName: tz.zoneName,
          gmtOffset: tz.gmtOffset,
          gmtOffsetName: tz.gmtOffsetName,
          abbreviation: tz.abbreviation,
          tzName: tz.tzName
        })) || [],
        latitude: country.latitude,
        longitude: country.longitude,
        emoji: '',
        emojiU: ''
      }));
    } catch (err) {
      console.error('Error loading countries:', err);
      return [];
    }
  }, []);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return countries;
    }
    
    const query = searchQuery.toLowerCase();
    return countries.filter(country => 
      country.name.toLowerCase().includes(query) ||
      country.iso2.toLowerCase().includes(query) ||
      country.iso3.toLowerCase().includes(query)
    );
  }, [countries, searchQuery]);

  const fetchStates = useCallback((countryIso2: string) => {
    if (!countryIso2) {
      setStates([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const countryStates = State.getStatesOfCountry(countryIso2);
      
      const formattedStates = countryStates.map((state: IState, index: number) => ({
        id: index + 1,
        name: state.name,
        state_code: state.isoCode,
        latitude: state.latitude || '',
        longitude: state.longitude || '',
        type: ''
      }));

      setStates(formattedStates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch states');
      console.error('Error fetching states:', err);
      setStates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearStates = useCallback(() => {
    setStates([]);
  }, []);

  const getCountryByIso2 = useCallback((iso2: string): CountryData | undefined => {
    return countries.find(country => country.iso2 === iso2);
  }, [countries]);

  const getStateByCode = useCallback((stateCode: string): StateData | undefined => {
    return states.find(state => state.state_code === stateCode);
  }, [states]);

  return {
    countries,
    states,
    loading,
    error,
    searchQuery,
    filteredCountries,
    setSearchQuery,
    fetchStates,
    clearStates,
    getCountryByIso2,
    getStateByCode
  };
};