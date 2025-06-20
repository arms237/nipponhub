"use client";
import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaSearch,
  FaShoppingCart,
  FaChevronDown,
} from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import logoLight from "../../app/images/NPH-black  LOGO.png";
import logoDark from "../../app/images/NPH-white LOGO.png";
import Image from "next/image";
import Link from "next/link";
import { BsCart } from "react-icons/bs";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { div } from "framer-motion/client";
import supabase from "@/app/lib/supabaseClient";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(
    null
  );
  const [activeLink, setActiveLink] = useState<string>("Accueil");
  const [isScrolled, setIsScrolled] = useState(false);
  const [profil, setProfil] = useState<string>('');
  const { session } = useAuth();
  // Utiliser usePathname pour détecter la route actuelle
  const pathname = usePathname();
  // Référence pour détecter les clics en dehors des menus
  const dropdownRef = React.useRef<HTMLUListElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermMobile, setSearchTermMobile] = useState('');
  const router = useRouter();

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    // Ajouter un gestionnaire de clic global pour fermer le dropdown quand on clique ailleurs
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { name: "Accueil", href: "/client", hasSubmenu: false },
    { name: "Figurines", href: "/client/figurines", hasSubmenu: false },
    {
      name: "Bijoux",
      href: "/client/bijoux",
      hasSubmenu: true,
      submenu: [
        { name: "Colliers", href: "/client/bijoux/colliers" },
        { name: "Bracelets", href: "/client/bijoux/bracelets" },
        { name: "Bagues", href: "/client/bijoux/bagues" },
        { name: "Boucles d'oreilles", href: "/client/bijoux/boucles" },
      ],
    },
    {
      name: "Accessoires",
      href: "/client/accessoires",
      hasSubmenu: true,
      submenu: [
        { name: "Ongles", href: "/client/accessoires/ongles" },
        { name: "Porte clé", href: "/client/accessoires/cles" },
      ],
    },
    {
      name: "Décorations",
      href: "/client/decorations",
      hasSubmenu: true,
      submenu: [
        { name: "Stickers", href: "/client/decorations/stickers" },
        { name: "Posters", href: "/client/decorations/posters" },
        { name: "Veilleuses", href: "/client/decorations/veilleuses" },
        { name: "Katanas", href: "/client/decorations/katanas" },
      ],
    },
    {
      name: "Vêtements",
      href: "/client/vetements",
      hasSubmenu: true,
      submenu: [
        { name: "T-shirt", href: "/client/vetements/tshirt" },
        { name: "Pull", href: "/client/vetements/pull" },
        { name: "Maillots", href: "/client/vetements/maillots" },
      ],
    },
    {
      name: "Autres",
      href: "/client/autres",
      hasSubmenu: false
    },

    { name: "Événements", href: "/client/evenements", hasSubmenu: false },
    { name: "Contact", href: "/client/contact", hasSubmenu: false },
    ...(profil === 'admin' || profil === 'owner' ? [{ name: "Dashboard", href: "/admin/dashboard", hasSubmenu: false }] : []),
  ];

  // Vérifie si le chemin actuel correspond à un menu ou un de ses sous-menus
  const isPathInMenu = (item: any) => {
    // Si le chemin correspond exactement au lien du menu
    if (pathname === item.href) return true;

    // Si le menu a des sous-menus, vérifie si le chemin commence par le chemin du menu parent
    if (item.hasSubmenu && item.submenu) {
      // Vérifie si le chemin correspond à l'un des sous-menus
      return item.submenu.some((subItem: any) => pathname === subItem.href);
    }

    return false;
  };

  const handleLinkClick = (linkName: string, parentMenu?: string) => {
    // Si un menu parent est spécifié (cas des sous-menu), c'est le parent qui devient actif
    setActiveLink(parentMenu || linkName);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  // Fonction pour gérer les clics sur les menus dropdown
  const handleDropdownToggle = (menuName: string) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
  };

  const toggleMobileSubmenu = (menuName: string) => {
    setActiveMobileSubmenu(activeMobileSubmenu === menuName ? null : menuName);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-base-100/95 backdrop-blur-md shadow-lg py-2"
          : "bg-base-100 py-2"
          }`}
      >
        {/*Top nav*/}
        <div className="flex items-center justify-between w-[90%] mx-auto">
          <div className="flex-shrink-0">
            <Link href="/client">
              <Image src={logoLight} alt="Logo" width={180} height={180} />
            </Link>
          </div>

          {/* Search */}
          <div className="input w-3/5 hidden lg:flex">
            <button
              type="button"
              onClick={() => {
                if (searchTerm.trim()) {
                  router.push(`/client/recherche?query=${encodeURIComponent(searchTerm)}`);
                }
              }}
              className="mr-2"
            >
              <FaSearch />
            </button>
            <input
              type="text"
              placeholder="Rechercher"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  router.push(`/client/recherche?query=${encodeURIComponent(searchTerm)}`);
                }
              }}
              className="w-full"
            />
          </div>

          {/* Cart */}
          <div className="hidden lg:flex items-center space-x-4">
            {!session ? (
              <Link href="/register" className="btn btn-primary">
                S'inscrire
              </Link>
            ) : (
              <Link href="/client/profile" className="w-15 h-15 bg-black text-white rounded-full flex items-center justify-center text-4xl font-bold">
                {session?.user?.user_metadata?.username.slice(0, 1)}
              </Link>
            )}
          </div>
          {/* Mobile Menu Active */}

          <button
            className="lg:hidden p-2 text-gray-700 hover:text-primary transition-colors duration-200"
            onClick={() => setMobileMenuOpen(true)}
          >
            <FaBars className="text-xl" />
          </button>

        </div>

        {/* Menu */}
        <div
          className={`container mx-auto px-4 hidden lg:flex justify-center items-center transition-all duration-300 ${isScrolled ? "py-0" : "py-2"
            }`}
        >
          {/* Logo */}
          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center justify-center space-x-1 z-1000 " ref={dropdownRef}>
            {menuItems.map((item) => (
              <li key={item.name} className="relative">
                {!item.hasSubmenu ? (
                  <Link
                    href={item.href}
                    onClick={() => handleLinkClick(item.name)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden ${isPathInMenu(item)
                      ? "text-primary"
                      : "text-base-content hover:text-primary"
                      }`}
                  >
                    {item.name}
                    {/* Underline effect */}
                    <span
                      className={`absolute bottom-0 left-1/2 h-0.5 bg-primary transition-all duration-300 transform -translate-x-1/2 ${isPathInMenu(item)
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                        }`}
                    />
                  </Link>
                ) : (
                  <>
                    <div
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden cursor-pointer ${isPathInMenu(item)
                        ? "text-primary"
                        : "text-base-content hover:text-primary"
                        }`}
                    >
                      {/* Lien vers la page principale du menu */}
                      <Link
                        href={item.href}
                        onClick={() => handleLinkClick(item.name)}
                        className="mr-1"
                      >
                        {item.name}
                      </Link>

                      {/* Bouton de dropdown séparé */}
                      <button
                        onClick={() => handleDropdownToggle(item.name)}
                        className="p-1"
                      >
                        <FaChevronDown className={`text-xs transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Underline effect */}
                      <span
                        className={`absolute bottom-0 left-1/2 h-0.5 bg-primary transition-all duration-300 transform -translate-x-1/2 ${isPathInMenu(item) || activeDropdown === item.name
                          ? "w-full"
                          : "w-0 hover:w-full"
                          }`}
                      />
                    </div>

                    {/* Desktop Dropdown */}
                    <ul className={`absolute top-full left-0 mt-1 w-48 bg-base-100 rounded-lg shadow-xl border border-gray-100 transform transition-all duration-200 origin-top ${activeDropdown === item.name ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}>
                      <div className="py-2">
                        {item.submenu?.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              onClick={() => handleLinkClick(subItem.name, item.name)}
                              className={`block w-full text-left px-4 py-3 text-sm text-base-content hover:bg-base-200 hover:text-primary transition-colors duration-150`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </div>
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>


        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-transparent backdrop-blur-sm z-51 transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Mobile Menu Panel */}
        <div
          className={`fixed top-0 right-0 h-full max-md:w-screen max-lg:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Conteneur principal avec défilement */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
              {!session && <h1 className="text-white font-bold text-xl">MENU</h1>}
              {session && <div className="flex items-center gap-2">
                <Link href="/client/profile" className="max-lg:flex hidden w-15 h-15 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {session?.user?.user_metadata?.username.slice(0, 1)}
                </Link>
                  <p className="font-bold text-xl line-clamp-1 text-center">{session?.user?.user_metadata?.username}</p>
              </div>}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 "
              >
                <FaX className="text-lg" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Rechercher..."
                  value={searchTermMobile}
                  onChange={e => setSearchTermMobile(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchTermMobile.trim()) {
                      router.push(`/client/recherche?query=${encodeURIComponent(searchTermMobile)}`);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => {
                    if (searchTermMobile.trim()) {
                      router.push(`/client/recherche?query=${encodeURIComponent(searchTermMobile)}`);
                      setMobileMenuOpen(false);
                    }
                  }}
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  <FaSearch />
                </button>
              </div>
            </div>

            {/* Contenu défilable */}
            <div className="flex-1 overflow-y-auto">
              {/* Mobile Menu Items */}
              <ul className="py-4">
                {menuItems.map((item) => (
                  <li
                    key={item.name}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex w-full">
                      {/* Lien vers la page principale */}
                      <Link
                        href={item.href}
                        onClick={() => handleLinkClick(item.name)}
                        className={`flex-grow flex items-center px-6 py-4 text-left font-medium transition-colors duration-200 ${isPathInMenu(item)
                          ? "text-primary bg-primary/10"
                          : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <span>{item.name}</span>
                      </Link>

                      {/* Bouton pour ouvrir/fermer le sous-menu */}
                      {item.hasSubmenu && (
                        <button
                          onClick={() => toggleMobileSubmenu(item.name)}
                          className="px-4 py-4 flex items-center justify-center"
                        >
                          <FaChevronDown
                            className={`text-sm transition-transform duration-200 ${activeMobileSubmenu === item.name
                              ? "rotate-180"
                              : ""
                              }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Mobile Submenu */}
                    {item.hasSubmenu && (
                      <ul
                        className={`bg-gray-50 border-t border-gray-200 overflow-hidden transition-all duration-300 ${activeMobileSubmenu === item.name
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                          }`}
                      >
                        {item.submenu?.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              onClick={() => handleLinkClick(subItem.name)}
                              className={`block w-full text-left px-12 py-3 text-sm transition-colors duration-200 ${pathname === subItem.href
                                ? "text-primary bg-primary/10"
                                : "text-gray-600 hover:text-primary hover:bg-primary/10"
                                }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Bouton de connexion fixe en bas */}
            <div className="p-4 border-t border-gray-200 bg-white flex justify-center">
              {!session && <Link
                href="/login"
                className="px-20 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
              >
                Se connecter
              </Link>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
