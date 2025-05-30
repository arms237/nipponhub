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

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(
    null
  );
  const [activeLink, setActiveLink] = useState<string>("Accueil");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: "Accueil", href: "/", hasSubmenu: false },
    { name: "Figurines", href: "/figurines", hasSubmenu: false },
    {
      name: "Bijoux",
      href: "/bijoux",
      hasSubmenu: true,
      submenu: [
        { name: "Colliers", href: "/bijoux/colliers" },
        { name: "Bracelets", href: "/bijoux/bracelets" },
        { name: "Bagues", href: "/bijoux/bagues" },
        { name: "Boucles d'oreilles", href: "/bijoux/boucles" },
      ],
    },
    {
      name: "Accessoires",
      href: "/accessoires",
      hasSubmenu: true,
      submenu: [
        { name: "Ongles", href: "/accessoires/ongles" },
        { name: "Porte clé", href: "/accessoires/cles" },
      ],
    },
    {
      name: "Vêtements",
      href: "/vetements",
      hasSubmenu: true,
      submenu: [
        { name: "T-shirt", href: "/vetements/tshirt" },
        { name: "Pull", href: "/vetements/pull" },
        { name: "Maillots", href: "/vetements/maillots" },
      ],
    },
    {
      name: "Autres",
      href: "/autres",
      hasSubmenu: true,
      submenu: [
        { name: "Cartes", href: "/autres/cartes" },
        { name: "Retour", href: "/autres/retour" },
      ],
    },

    { name: "Événements", href: "/evenements", hasSubmenu: false },
    { name: "Contact", href: "/contact", hasSubmenu: false },
  ];

  const handleLinkClick = (linkName: string) => {
    setActiveLink(linkName);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const toggleMobileSubmenu = (menuName: string) => {
    setActiveMobileSubmenu(activeMobileSubmenu === menuName ? null : menuName);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-base-100/95 backdrop-blur-md shadow-lg py-2"
            : "bg-base-100 py-2"
        }`}
      >
        {/*Top nav*/}
        <div className="flex items-center justify-between w-[90%] mx-auto">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image src={logoLight} alt="Logo" width={180} height={180} />
            </Link>
          </div>

          {/* Search */}
          <div className="input w-3/5 hidden lg:flex">
              <FaSearch/>
              <input type="text" placeholder="Rechercher"/>
            </div>

          {/* Cart */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/login" className="btn btn-primary">
              S'inscrire
            </Link>
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
          className={`container mx-auto px-4 hidden lg:flex justify-center items-center transition-all duration-300 ${
            isScrolled ? "py-0" : "py-2"
          }`}
        >
          {/* Logo */}
          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center justify-center space-x-1 z-1000 ">
            {menuItems.map((item) => (
              <li key={item.name} className="relative group">
                {!item.hasSubmenu ? (
                  <Link
                    href={item.href}
                    onClick={() => handleLinkClick(item.name)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                      activeLink === item.name
                        ? "text-primary"
                        : "text-base-content hover:text-primary"
                    }`}
                  >
                    {item.name}
                    {/* Underline effect */}
                    <span
                      className={`absolute bottom-0 left-1/2 h-0.5 bg-primary transition-all duration-300 transform -translate-x-1/2 ${
                        activeLink === item.name
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                ) : (
                  <>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                        activeLink === item.name
                          ? "text-primary"
                          : "text-base-content hover:text-primary"
                      }`}
                    >
                      {item.name}
                      <FaChevronDown className="ml-1 text-xs transition-transform duration-200 group-hover:rotate-180" />
                      {/* Underline effect */}
                      <span
                        className={`absolute bottom-0 left-1/2 h-0.5 bg-primary transition-all duration-300 transform -translate-x-1/2 ${
                          activeLink === item.name
                            ? "w-full"
                            : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>

                    {/* Desktop Dropdown */}
                    <ul className="absolute top-full left-0 mt-1 w-48 bg-base-100 rounded-lg shadow-xl border border-gray-100 transform transition-all duration-200 origin-top opacity-0 scale-y-95 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:scale-y-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
                      <div className="py-2">
                        {item.submenu?.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              onClick={() => handleLinkClick(subItem.name)}
                              className="block w-full text-left px-4 py-3 text-sm text-base-content hover:bg-base-200 hover:text-primary transition-colors duration-150"
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
        className={`fixed inset-0 bg-transparent backdrop-blur-sm z-51 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Mobile Menu Panel */}
        <div
          className={`fixed top-0 right-0 h-full max-md:w-screen max-lg:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Conteneur principal avec défilement */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-secondary">
              <h1 className="text-white font-bold text-xl">MENU</h1>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white p-2 "
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                    <button
                      onClick={() =>
                        item.hasSubmenu
                          ? toggleMobileSubmenu(item.name)
                          : handleLinkClick(item.name)
                      }
                      className={`w-full flex items-center justify-between px-6 py-4 text-left font-medium transition-colors duration-200 ${
                        activeLink === item.name
                          ? "text-primary bg-primary/10"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{item.name}</span>
                      {item.hasSubmenu && (
                        <FaChevronDown
                          className={`text-sm transition-transform duration-200 ${
                            activeMobileSubmenu === item.name
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      )}
                    </button>

                    {/* Mobile Submenu */}
                    {item.hasSubmenu && (
                      <ul
                        className={`bg-gray-50 border-t border-gray-200 overflow-hidden transition-all duration-300 ${
                          activeMobileSubmenu === item.name
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {item.submenu?.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              onClick={() => handleLinkClick(subItem.name)}
                              className={`block w-full text-left px-12 py-3 text-sm transition-colors duration-200 ${
                                activeLink === subItem.name
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
              <Link
                href="/login"
                className="px-20 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
