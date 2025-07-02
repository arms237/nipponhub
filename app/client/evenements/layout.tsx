import React from 'react'

export const metadata = {
  title: 'Evenements',
  description: 'Evenements otakus',
}

export default function EvenementsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  )
}
