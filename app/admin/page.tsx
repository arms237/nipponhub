'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHome() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers le dashboard
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirection...</h1>
        <p className="text-gray-600">Vous allez être redirigé vers le tableau de bord.</p>
      </div>
    </div>
  );
} 