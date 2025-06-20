import { FilterProvider } from '@/app/contexts/FilterContext';
import Filter from '@/components/layout/Filter';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: "NIPPON HUB - Recherche",
  description: "Recherchez un produit otaku",
};

export default function RechercheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FilterProvider>
      <Filter/>
      {children}
    </FilterProvider>
  )
}
