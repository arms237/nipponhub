import { useState, useEffect } from 'react';
import supabase from '@/app/lib/supabaseClient';
import { cityType } from '@/app/types/types';

export const useCities = (country?: string) => {
  const [cities, setCities] = useState<cityType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = async (targetCountry?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('cities')
        .select('*')
        .order('name', { ascending: true });

      if (targetCountry) {
        query = query.eq('country', targetCountry);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setCities(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des villes:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities(country);
  }, [country]);

  const getCitiesByCountry = (targetCountry: string) => {
    return cities.filter(city => city.country === targetCountry);
  };

  const getCityName = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    return city?.name || 'Ville inconnue';
  };

  const getCityNames = (cityIds: string[]) => {
    return cityIds.map(id => getCityName(id)).filter(name => name !== 'Ville inconnue');
  };

  return {
    cities,
    loading,
    error,
    fetchCities,
    getCitiesByCountry,
    getCityName,
    getCityNames,
    refresh: () => fetchCities(country)
  };
}; 