import React from 'react';
import { Metadata } from 'next';
import Filter from '@/components/layout/Filter';
import { FilterProvider } from '@/app/contexts/FilterContext';

export const metadata: Metadata = {
  title: "NIPPON HUB - Bijoux",
  description: "Découvrez notre sélection exclusive de produits otaku et de mangas",
};

export default function BijouxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <main className="flex">
       <FilterProvider>
       <Filter />
       {children}
       </FilterProvider>
      </main>
   
  );
}