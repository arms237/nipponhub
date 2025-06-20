import React from 'react'
import { FilterProvider } from '@/app/contexts/FilterContext'
import Filter from '@/components/layout/Filter'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "NIPPON HUB - Décorations",
  description: "Découvrez notre sélection exclusive de décorations otaku",
};

export default function DecorationsLayout({
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
