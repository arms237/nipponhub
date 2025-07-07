"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import supabase from '@/app/lib/supabaseClient';
import { orderType } from '@/app/types/types';
import { subDays, startOfMonth, format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

type Period = '7d' | '30d' | 'month' | 'all';

export default function Stats() {
  const [orders, setOrders] = useState<orderType[]>([]);
  const [period, setPeriod] = useState<Period>('30d');
  const [stockStats, setStockStats] = useState({
    totalValue: 0,
    promotionValue: 0
  });

  // Fonction pour formater les grands nombres
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }  else {
      return `${amount.toLocaleString()} FCFA`;
    }
  };

  // Récupérer les statistiques de stock
  useEffect(() => {
    const fetchStockStats = async () => {
      try {
        // Calculer la valeur totale des produits en stock
        const { data: allProducts, error: valueError } = await supabase
          .from('products')
          .select('price, stock')
          .gt('stock', 0);

        // Calculer la valeur des produits en promotion
        const { data: promoProducts, error: promoValueError } = await supabase
          .from('products')
          .select('price, stock')
          .eq('is_on_sale', true)
          .gt('stock', 0);

        if (!valueError && !promoValueError) {
          // Calculer la valeur totale
          const totalValue = allProducts?.reduce((sum, product) => {
            return sum + (product.price * product.stock);
          }, 0) || 0;

          // Calculer la valeur des promotions
          const promotionValue = promoProducts?.reduce((sum, product) => {
            return sum + (product.price * product.stock);
          }, 0) || 0;

          setStockStats({
            totalValue,
            promotionValue
          });
        }
      } catch (error) {
        console.error('Erreur lors du calcul des statistiques de stock:', error);
      }
    };

    fetchStockStats();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      let query = supabase
        .from('orders')
        .select(`*, products(title, category)`);

      const now = new Date();
      if (period === '7d') {
        query = query.gte('created_at', subDays(now, 7).toISOString());
      } else if (period === '30d') {
        query = query.gte('created_at', subDays(now, 30).toISOString());
      } else if (period === 'month') {
        query = query.gte('created_at', startOfMonth(now).toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data as orderType[]);
      }
    };

    fetchOrders();
  }, [period]);

  const { totalRevenue, totalSales, topProducts, salesByCategory } = useMemo(() => {
    if (!orders) return { totalRevenue: 0, totalSales: 0, topProducts: [], salesByCategory: {} };

    const totalRevenue = orders.reduce((acc, order) => acc + (order.price * order.quantity), 0);
    const totalSales = orders.length;

    const productSales = orders.reduce((acc: Record<string, number>, order) => {
      const productId = order.product_id;
      acc[productId] = (acc[productId] || 0) + order.quantity;
      return acc;
    }, {});

    const topProducts = Object.entries(productSales)
      .map(([productId, quantity]) => {
        const product = orders.find(o => o.product_id === productId)?.products;
        return { name: product?.title || 'Produit inconnu', quantity };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const salesByCategory = orders.reduce((acc, order) => {
        const category = order.products?.category || 'Non classé';
        acc[category] = (acc[category] || 0) + (order.price * order.quantity);
        return acc;
    }, {} as Record<string, number>);

    return { totalRevenue, totalSales, topProducts, salesByCategory };
  }, [orders]);
  
  const pieData = {
    labels: Object.keys(salesByCategory),
    datasets: [
      {
        data: Object.values(salesByCategory),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)',
          'rgba(251, 191, 36, 0.7)', 'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)', 'rgba(236, 72, 153, 0.7)'
        ],
      },
    ],
  };

  const salesByDay = useMemo(() => {
    const sales = orders.reduce((acc, order) => {
        const day = format(new Date(order.created_at), 'yyyy-MM-dd');
        acc[day] = (acc[day] || 0) + (order.price * order.quantity);
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(sales).sort(([dayA], [dayB]) => new Date(dayA).getTime() - new Date(dayB).getTime());
  }, [orders]);

  const barData = {
      labels: salesByDay.map(([day]) => format(new Date(day), 'dd/MM')),
      datasets: [{
          label: 'Ventes par jour',
          data: salesByDay.map(([, total]) => total),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
      }]
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tableau de Bord</h1>
        <div className="flex items-center gap-2">
            {(['7d', '30d', 'month', 'all'] as Period[]).map(p => (
                <button 
                    key={p} 
                    onClick={() => setPeriod(p)}
                    className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-ghost'}`}
                >
                    {p === '7d' && '7 jours'}
                    {p === '30d' && '30 jours'}
                    {p === 'month' && 'Ce mois-ci'}
                    {p === 'all' && 'Tout'}
                </button>
            ))}
        </div>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Chiffre d&apos;affaires</h2>
          <p className="text-3xl font-bold">{totalRevenue.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Nombre de ventes</h2>
          <p className="text-3xl font-bold">{totalSales}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Valeur totale stock</h2>
          <p className="text-3xl font-bold">{formatCurrency(stockStats.totalValue)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Valeur promotions</h2>
          <p className="text-3xl font-bold">{formatCurrency(stockStats.promotionValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graphiques */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Ventes par jour</h2>
              <Bar data={barData} options={{ responsive: true }} />
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Ventes par catégorie</h2>
              <Pie data={pieData} options={{ responsive: true }} />
            </div>
        </div>
        
        {/* Articles les plus vendus */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Articles les plus vendus</h2>
          <ul className="space-y-4">
            {topProducts.map((product, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{product.name}</span>
                <span className="font-bold badge badge-primary">{product.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Historique des ventes */}
      <div className="bg-white p-6 rounded-xl shadow mt-8">
          <h2 className="text-lg font-semibold mb-4">Historique des ventes récentes</h2>
          <div className="overflow-x-auto max-h-96">
            <table className="table w-full">
                <thead>
                    <tr><th>Date</th><th>Produit</th><th>Quantité</th><th>Total</th></tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</td>
                            <td>{order.products?.title || 'Produit inconnu'}</td>
                            <td>{order.quantity}</td>
                            <td>{(order.price * order.quantity).toLocaleString()} FCFA</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
