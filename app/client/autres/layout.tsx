import React from 'react'
import { FilterProvider } from '@/app/contexts/FilterContext'
import { Metadata } from 'next'
import Filter from '@/components/layout/Filter'

export const metadata: Metadata = {
  title: "NIPPON HUB - Autres",
  description: "Découvrez notre sélection exclusive de produits otaku et de mangas",
};

export default function AutresLayout({
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
