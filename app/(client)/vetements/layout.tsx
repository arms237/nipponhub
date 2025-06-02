import React from 'react';
import { Metadata } from 'next';
import Filter from '@/components/layout/Filter';
import { FilterProvider } from '@/app/contexts/FilterContext';

export const metadata: Metadata = {
  title: "NIPPON HUB - Vetements",
  description: "Découvrez notre sélection exclusive de produits otaku et de mangas",
};

export default function VetementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
       <FilterProvider>
       <Filter />
       {children}
       </FilterProvider>
      
      </main>
    </div>
  );
}