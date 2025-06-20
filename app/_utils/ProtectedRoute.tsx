// components/auth/ProtectedRoute.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { useCountry } from '@/app/contexts/CountryContext';
import Loading from '@/app/loading';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabaseClient';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { country, setCountry } = useCountry();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedCountry = localStorage.getItem('country');
   
    if (!savedCountry) {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [router, session]);

  if (isLoading) {
    return <Loading />;
  }

  if (!country) {
    return null; // ou un message d'erreur
  }

  return <>{children}</>;
}