"use client";

import { FiHome, FiShoppingBag, FiUsers, FiSettings, FiPieChart, FiDollarSign, FiBox } from 'react-icons/fi';
import { FaSignOutAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import supabase from '@/app/lib/supabaseClient';

const stats = [
  { name: 'Produits en promotion', value: '0', change: 'Actif', changeType: 'increase' },
  { name: 'Promotions expirantes', value: '0', change: '7 jours', changeType: 'neutral' },
  { name: 'Total produits', value: '0', change: 'En stock', changeType: 'increase' },
  { name: 'Produits hors stock', value: '0', change: 'Rupture', changeType: 'decrease' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { session } = useAuth();
  const [expiringPromotions, setExpiringPromotions] = useState<any[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [statsData, setStatsData] = useState({
    activePromotions: 0,
    expiringPromotions: 0,
    totalProducts: 0,
    outOfStockProducts: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Récupérer les statistiques réelles
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // Produits en promotion actifs
        const { data: activePromos, error: activeError } = await supabase
          .from('products')
          .select('id')
          .eq('is_on_sale', true)
          .not('sale_end_date', 'is', null)
          .gte('sale_end_date', new Date().toISOString());

        // Promotions expirantes (dans les 7 prochains jours)
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const { data: expiringPromos, error: expiringError } = await supabase
          .from('products')
          .select('id')
          .eq('is_on_sale', true)
          .not('sale_end_date', 'is', null)
          .gte('sale_end_date', now.toISOString())
          .lte('sale_end_date', sevenDaysFromNow.toISOString());

        // Total produits
        const { count: totalProducts, error: totalError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Produits hors de stock
        const { data: outOfStock, error: outOfStockError } = await supabase
          .from('products')
          .select('id')
          .eq('stock', 0);

        if (!activeError && !expiringError && !totalError && !outOfStockError) {
          setStatsData({
            activePromotions: activePromos?.length || 0,
            expiringPromotions: expiringPromos?.length || 0,
            totalProducts: totalProducts || 0,
            outOfStockProducts: outOfStock?.length || 0
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Vérifier les promotions qui vont bientôt expirer
  useEffect(() => {
    const checkExpiringPromotions = async () => {
      setLoadingPromotions(true);
      try {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const { data, error } = await supabase
          .from('products')
          .select('id, title, sale_end_date, discount_percentage')
          .eq('is_on_sale', true)
          .not('sale_end_date', 'is', null)
          .gte('sale_end_date', now.toISOString())
          .lte('sale_end_date', sevenDaysFromNow.toISOString())
          .order('sale_end_date', { ascending: true })
          .limit(5);

        if (error) {
          console.error('Erreur lors de la vérification des promotions expirantes:', error);
          return;
        }

        setExpiringPromotions(data || []);
      } catch (error) {
        console.error('Erreur lors de la vérification des promotions expirantes:', error);
      } finally {
        setLoadingPromotions(false);
      }
    };

    checkExpiringPromotions();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-800">Tableau de bord</h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-200">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </button>
              <Link href="/client/profile" className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white font-semibold">
                {session?.user?.user_metadata?.username.slice(0,1)}
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Produits en promotion</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {loadingStats ? '...' : statsData.activePromotions}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Actif
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Promotions expirantes</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {loadingStats ? '...' : statsData.expiringPromotions}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                  7 jours
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total produits</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {loadingStats ? '...' : statsData.totalProducts}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  En stock
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Produits hors stock</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {loadingStats ? '...' : statsData.outOfStockProducts}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                  Rupture
                </span>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Actions rapides</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/admin/produits')}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center">
                  <FiShoppingBag className="text-primary text-xl mr-3" />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Gérer les produits</h4>
                    <p className="text-sm text-gray-600">Ajouter, modifier, supprimer</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/admin/commandes')}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center">
                  <FiBox className="text-primary text-xl mr-3" />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Voir les commandes</h4>
                    <p className="text-sm text-gray-600">Suivre les ventes</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/admin/stats')}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center">
                  <FiPieChart className="text-primary text-xl mr-3" />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Statistiques</h4>
                    <p className="text-sm text-gray-600">Analyser les performances</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Promotions expirantes */}
          {expiringPromotions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Promotions expirantes</h3>
                <span className="text-sm text-orange-600 font-medium">
                  {expiringPromotions.length} promotion(s)
                </span>
              </div>
              <div className="space-y-3">
                {expiringPromotions.map((promotion) => {
                  const endDate = new Date(promotion.sale_end_date);
                  const now = new Date();
                  const diffTime = endDate.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={promotion.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{promotion.title}</p>
                        <p className="text-sm text-gray-600">
                          -{promotion.discount_percentage}% • Expire dans {diffDays} jour(s)
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/produits`)}
                        className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                      >
                        Gérer →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section Informations */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-lg font-semibold mb-4">Informations système</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Statut des promotions:</span>
                <span className="text-green-600 font-medium">Actif</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gestion des promotions:</span>
                <span className="text-blue-600 font-medium">Affichage "Terminée"</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dernière mise à jour:</span>
                <span className="text-gray-800">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Section Gestion des promotions */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-lg font-semibold mb-4">Gestion des promotions</h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-medium text-green-800 mb-2">Nouvelle approche</h3>
                <p className="text-sm text-green-700 mb-3">
                  Les promotions expirées affichent maintenant "Promotion terminée" au lieu d'être automatiquement désactivées.
                </p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Le badge devient gris avec "Terminée"</li>
                  <li>• Le prix barré reste visible mais en gris clair</li>
                  <li>• Un message "Prix normal" apparaît</li>
                  <li>• Vous gardez le contrôle total sur les promotions</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Actions recommandées</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Pour une gestion optimale des promotions :
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/admin/produits')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    Gérer les produits et promotions
                  </button>
                  <p className="text-xs text-blue-600">
                    Vous pouvez désactiver manuellement les promotions terminées dans la section produits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

