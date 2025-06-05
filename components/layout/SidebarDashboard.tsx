"use client"
import { FiHome, FiShoppingBag, FiUsers, FiSettings, FiPieChart, FiDollarSign, FiBox } from 'react-icons/fi';
import Link from 'next/link';
import React,{useState} from 'react'
import { FaSignOutAlt } from 'react-icons/fa';

export default function SidebarDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <div>
      {/* Sidebar */}
      <div 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-indigo-800 text-white transition-all duration-300 ease-in-out h-screen`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold">NipponHub Admin</h1>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-indigo-700"
          >
            ☰
          </button>
        </div>
        
        <nav className="mt-8">
          <NavItem icon={<FiHome size={20} />} text="Tableau de bord" isActive={true} isOpen={isSidebarOpen} href="/admin/dashboard" />
          <NavItem icon={<FiShoppingBag size={20} />} text="Produits" isOpen={isSidebarOpen} href="/admin/products" />
          <NavItem icon={<FiBox size={20} />} text="Commandes" isOpen={isSidebarOpen} href="/admin/orders" />
          <NavItem icon={<FiUsers size={20} />} text="Clients" isOpen={isSidebarOpen} href="/admin/users" />
          <NavItem icon={<FiPieChart size={20} />} text="Statistiques" isOpen={isSidebarOpen} href="/admin/stats" />
          <NavItem icon={<FiDollarSign size={20} />} text="Promotions" isOpen={isSidebarOpen} href="/admin/promotions" />
          <NavItem icon={<FiSettings size={20} />} text="Paramètres" isOpen={isSidebarOpen} href="/admin/settings" />
          
          <div className="absolute bottom-0 w-full p-4">
            <button className="flex items-center w-full p-3 rounded-lg text-red-300 hover:bg-indigo-700">
              <FaSignOutAlt size={20} />
              {isSidebarOpen && <span className="ml-3">Déconnexion</span>}
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}
const NavItem = ({ icon, text, isActive = false, isOpen, href }: { icon: React.ReactNode, text: string, isActive?: boolean, isOpen: boolean, href: string }) => {
  return (
    <Link 
      href={href} 
      className={`flex items-center p-3 mx-2 my-1 rounded-lg transition-colors ${
        isActive 
          ? 'bg-indigo-700 text-white' 
          : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
      }`}
    >
      <span>{icon}</span>
      {isOpen && <span className="ml-3">{text}</span>}
    </Link>
  );
};
