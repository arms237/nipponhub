"use client"
import { FiHome, FiShoppingBag, FiUsers, FiSettings, FiPieChart, FiDollarSign, FiBox } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React,{useState} from 'react'
import { FaHome, FaSignOutAlt } from 'react-icons/fa';

export default function SidebarDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  
  const navItems = [
    { icon: <FiHome size={20} />, text: "Tableau de bord", href: "/admin/dashboard" },
    { icon: <FiShoppingBag size={20} />, text: "Produits", href: "/admin/produits" },
    { icon: <FiBox size={20} />, text: "Commandes", href: "/admin/commandes" },
    { icon: <FiUsers size={20} />, text: "Clients", href: "/admin/clients" },
    { icon: <FiPieChart size={20} />, text: "Statistiques", href: "/admin/stats" },
    { icon: <FiDollarSign size={20} />, text: "Promotions", href: "/admin/promotions" },
    { icon: <FiSettings size={20} />, text: "Paramètres", href: "/admin/settings" },
    { icon: <FaHome size={20} />, text: "Accueil", href: "/client" },
  ];
  return (
    <div>
      {/* Sidebar */}
      <div 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-primary text-white transition-all duration-300 h-screen ease-in-out`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && <h1 className="text-xl font-bold">NipponHub Admin</h1>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-primary"
          >
            ☰
          </button>
        </div>
        
        <nav className="mt-8">
          {navItems.map((item, index) => (
            <NavItem 
              key={index}
              icon={item.icon} 
              text={item.text} 
              isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              isOpen={isSidebarOpen} 
              href={item.href} 
            />
          ))}
          
          <div className="absolute bottom-0 p-4 w-full">
            <button className="flex items-center w-full p-3 rounded-lg text-white px-3 hover:bg-secondary">
              <FaSignOutAlt size={20} />
              {isSidebarOpen && <span className="ml-3">Déconnexion</span>}
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}
const NavItem = ({ 
  icon, 
  text, 
  isActive = false, 
  isOpen, 
  href 
}: { 
  icon: React.ReactNode, 
  text: string, 
  isActive?: boolean, 
  isOpen: boolean, 
  href: string 
}) => {
  return (
    <Link 
      href={href} 
      className={`flex items-center p-3 mx-2 my-1 rounded-lg transition-colors ${
        isActive 
          ? 'bg-secondary text-white' 
          : 'text-white hover:bg-secondary hover:text-white'
      }`}
    >
      <span>{icon}</span>
      {isOpen && <span className="ml-3">{text}</span>}
    </Link>
  );
};
