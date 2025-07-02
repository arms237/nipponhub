'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCountry } from '@/app/contexts/CountryContext';
import logo from '@/app/images/NPH-white LOGO.png'
import Loading from './loading';
import { useAuth } from './contexts/AuthContext';
import supabase from './lib/supabaseClient';
import Image from 'next/image';
type Country = 'Cameroun' | 'Gabon';

export default function Home() {
  const router = useRouter();
  const { country, setCountry } = useCountry();
  const [isLoading, setIsLoading] = useState(true)
  const { session } = useAuth()
  /**
   * Rediriger vers /client si un pays est déjà sélectionné.
   * Ce useEffect est utilisé pour détecter si un pays a déjà été
   * sélectionné et pour rediriger l'utilisateur vers la page /client
   * si c'est le cas.
   */
  useEffect(() => {
    // Si un pays est déjà sélectionné, rediriger vers /client
    if (session) {
      supabase.from('users').select('country').eq('id', session.user.id).single().then(({data, error}) => {
        if (error) {
          console.error(error);
        } else {
          setCountry(data.country);
          localStorage.setItem('country', data.country);
          setIsLoading(false);
          router.push('/client'); // Redirection vers la page d'accueil
        }
      });
    } else if (country) {
      router.push('/client');
    }
    setIsLoading(false)
  }, [country, router, session, setCountry]);

  const handleCountrySelect = (selectedCountry: Country) => {

    setCountry(selectedCountry);
    localStorage.setItem('country', selectedCountry);


  };

  if (isLoading) {
    return <Loading />
  }
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-xl">
        {/* En-tête avec logo */}
        <div className="bg-black p-6 flex justify-center">
          <div className="w-48">
            <Image
              src={logo.src}
              alt="NipponHub Logo"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue sur NipponHub</h1>
            <p className="text-gray-600">Veuillez sélectionner votre pays de livraison</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleCountrySelect('Cameroun')}
              className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Cameroon</span>
              <span className="text-sm opacity-80">CMR</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative px-4 bg-white text-sm text-gray-500">
                ou
              </div>
            </div>

            <button
              onClick={() => handleCountrySelect('Gabon')}
              className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Gabon</span>
              <span className="text-sm opacity-80">GAB</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Votre sélection déterminera les produits disponibles et les frais de livraison
          </p>
        </div>
      </div>
    </main>
  );
}
