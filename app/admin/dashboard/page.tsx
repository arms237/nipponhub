"use client";

import { FiHome, FiShoppingBag, FiUsers, FiSettings, FiPieChart, FiDollarSign, FiBox } from 'react-icons/fi';
import { FaSignOutAlt } from 'react-icons/fa';
import { useState } from 'react';
import Link from 'next/link';

const stats = [
  { name: 'Ventes totales', value: '2,345', change: '+12%', changeType: 'increase' },
  { name: 'Nouveaux clients', value: '143', change: '+5%', changeType: 'increase' },
  { name: 'Commandes en cours', value: '24', change: '-2%', changeType: 'decrease' },
  { name: 'Revenu mensuel', value: '84 590 FCFA', change: '+23%', changeType: 'increase' },
];

const recentOrders = [
  { id: 1, customer: 'John Doe', product: 'Figurine Naruto', total: '6000 FCFA', status: 'Expédié' },
  { id: 2, customer: 'Jane Smith', product: 'Poster One Piece', total: '2500 FCFA', status: 'En attente' },
  { id: 3, customer: 'Robert Johnson', product: 'Mug Dragon Ball', total: '2000 FCFA', status: 'Expédié' },
  { id: 4, customer: 'Emily Davis', product: 'T-shirt My Hero Academia', total: '2500 FCFA', status: 'Annulé' },
];

export default function AdminDashboard() {
    

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
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    stat.changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Commandes récentes</h3>
              <button className="text-sm text-primary hover:text-secondary">Voir tout</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'Expédié' ? 'bg-green-100 text-green-800' :
                          order.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

