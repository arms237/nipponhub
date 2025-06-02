"use client";
import { createContext, useContext, useState } from "react";

interface FilterContextType {
  maxPrice: number;
  setMaxPrice: (price: number) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [maxPrice, setMaxPrice] = useState(100000);

  return (
    <FilterContext.Provider value={{ maxPrice, setMaxPrice }}>
      {children}
    </FilterContext.Provider>
  );
};

export function useFilters(){
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error("useFilters must be used within a FilterProvider");
    }
    return context;
}