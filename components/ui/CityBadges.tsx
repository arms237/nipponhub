import React from 'react';
import { useCities } from '@/app/hooks/useCities';

interface CityBadgesProps {
  cityIds: string[];
  country: string;
  className?: string;
}

const CityBadges: React.FC<CityBadgesProps> = ({ cityIds, country, className = '' }) => {
  const { getCityNames, loading } = useCities(country);
  
  if (loading) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-6 w-16 rounded-full"></div>
        <div className="animate-pulse bg-gray-200 h-6 w-20 rounded-full"></div>
      </div>
    );
  }

  const cityNames = getCityNames(cityIds);

  if (cityNames.length === 0) {
    return null;
  }

  // Couleurs par pays
  const getCountryColors = (country: string) => {
    switch (country.toLowerCase()) {
      case 'cameroun':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200'
        };
      case 'gabon':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200'
        };
    }
  };

  const colors = getCountryColors(country);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Disponible à :
      </div>
      {cityNames.map((cityName, index) => (
        <span
          key={index}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
        >
          {cityName}
        </span>
      ))}
    </div>
  );
};

export default CityBadges; 