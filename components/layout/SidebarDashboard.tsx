"use client"
import { FiHome, FiShoppingBag, FiUsers, FiSettings, FiPieChart, FiBox, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React,{useEffect, useState} from 'react'
import { FaHome, FaSignOutAlt, FaUsers, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';
import supabase from '@/app/lib/supabaseClient';
import logo from '@/app/images/NPH-black  LOGO.png'
import Image from 'next/image';
export default function SidebarDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { session } = useAuth();
  const [profil, setProfil] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if(session){
      const fetchProfil = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if(data){
          setProfil(data.role);
        }
      }
      fetchProfil();
    }
  }, [session]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { icon: <FiHome size={20} />, text: "Tableau de bord", href: "/admin/dashboard" },
    { icon: <FiShoppingBag size={20} />, text: "Produits", href: "/admin/produits" },
    { icon: <FiBox size={20} />, text: "Commandes", href: "/admin/commandes" },
    ...(profil === 'admin' || profil === 'owner' ? [  { icon: <FiUsers size={20} />, text: "Utilisateurs", href: "/owner/users" }] : []),
    { icon: <FiPieChart size={20} />, text: "Statistiques", href: "/admin/stats" },
    { icon: <FiCalendar size={20} />, text: "Evenements", href: "/admin/events" },
    { icon: <FiSettings size={20} />, text: "Paramètres", href: "/admin/parametres" },
  ];

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-600 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2  focus:ring-inset focus:ring-indigo-500 lg:hidden"
      >
        {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6 mt-4" />}
      </button>

      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gray-50">
           <Link href="/client">
            <Image src={logo} alt='logo' width={150} height={150} />
           </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                {isSidebarOpen && <span className="ml-3">{item.text}</span>}
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 p-4 w-full">
            <button className="flex items-center w-full p-3 rounded-lg text-gray-900 px-3 hover:bg-primary/10 hover:text-primary">
              <FaSignOutAlt size={20} />
              {isSidebarOpen && <span className="ml-3">Déconnexion</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
