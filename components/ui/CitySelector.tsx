import React, { useState } from 'react';
import { useCities } from '@/app/hooks/useCities';

interface CitySelectorProps {
  selectedCityIds: string[];
  country: string;
  onChange: (cityIds: string[]) => void;
  className?: string;
  label?: string;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  selectedCityIds,
  country,
  onChange,
  className = '',
  label = 'Villes disponibles'
}) => {
  const {loading, getCitiesByCountry } = useCities(country);
  const [isOpen, setIsOpen] = useState(false);

  const availableCities = getCitiesByCountry(country);

  const handleCityToggle = (cityId: string) => {
    const newSelection = selectedCityIds.includes(cityId)
      ? selectedCityIds.filter(id => id !== cityId)
      : [...selectedCityIds, cityId];
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    const allCityIds = availableCities.map(city => city.id);
    onChange(allCityIds);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const getSelectedCityNames = () => {
    return availableCities
      .filter(city => selectedCityIds.includes(city.id))
      .map(city => city.name);
  };

  if (loading) {
    return (
      <div className={`form-control ${className}`}>
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`form-control ${className}`}>
      <label className="label">
        <span className="label-text">{label}</span>
        <span className="label-text-alt">
          {selectedCityIds.length} ville(s) sélectionnée(s)
        </span>
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="input input-bordered w-full text-left flex items-center justify-between"
        >
          <span className="truncate">
            {selectedCityIds.length === 0
              ? 'Sélectionner les villes'
              : getSelectedCityNames().join(', ')}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="btn btn-xs btn-outline"
                >
                  Tout sélectionner
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="btn btn-xs btn-outline"
                >
                  Tout désélectionner
                </button>
              </div>
            </div>
            
            <div className="p-2">
              {availableCities.length === 0 ? (
                <p className="text-gray-500 text-sm py-2">
                  Aucune ville disponible pour ce pays
                </p>
              ) : (
                availableCities.map((city) => (
                  <label
                    key={city.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCityIds.includes(city.id)}
                      onChange={() => handleCityToggle(city.id)}
                      className="checkbox checkbox-sm mr-3"
                    />
                    <span className="text-sm">{city.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Affichage des villes sélectionnées */}
      {selectedCityIds.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {getSelectedCityNames().map((cityName, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
              >
                {cityName}
                <button
                  type="button"
                  onClick={() => {
                    const city = availableCities.find(c => c.name === cityName);
                    if (city) handleCityToggle(city.id);
                  }}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelector; 