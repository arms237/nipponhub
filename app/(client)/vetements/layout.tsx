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
    <main className="flex max-lg:flex-col w-full">
      <FilterProvider>
        <Filter />
        {children}
      </FilterProvider>
    </main>
  );
}