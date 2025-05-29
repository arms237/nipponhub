"use client";
import React, { useState } from "react";
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
      name: "Autres",
      href: "/autres",
      hasSubmenu: true,
      submenu: [
        { name: "Cartes", href: "/autres/cartes" },
        { name: "Retour", href: "/autres/retour" },
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
    { name: "Événements", href: "/evenements", hasSubmenu: false },
    { name: "Contact", href: "/contact", hasSubmenu: false },
  ];

  const handleLinkClick = (linkName: string) => {
    setActiveLink(linkName);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const toggleDropdown = (menuName: string) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
  };

  const toggleMobileSubmenu = (menuName: string) => {
    setActiveMobileSubmenu(activeMobileSubmenu === menuName ? null : menuName);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="w-full bg-base-100">
        <div className="w-full px-5">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <Image src={logoLight} alt="Logo" width={100} height={100} />
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => (
                <div key={item.name} className="relative group">
                  <button
                    onClick={() =>
                      item.hasSubmenu
                        ? toggleDropdown(item.name)
                        : handleLinkClick(item.name)
                    }
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                      activeLink === item.name
                        ? "text-primary"
                        : "text-base-content hover:text-primary"
                    }`}
                  >
                    {item.name}
                    {item.hasSubmenu && (
                      <FaChevronDown
                        className={`ml-1 text-xs transition-transform duration-200 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    )}
                    {/* Underline effect */}
                    <span
                      className={`absolute bottom-0 left-1/2 h-0.5 bg-primary transition-all duration-300 transform -translate-x-1/2 ${
                        activeLink === item.name
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    />
                  </button>

                  {/* Desktop Dropdown */}
                  {item.hasSubmenu && (
                    <div
                      className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 transform transition-all duration-200 origin-top ${
                        activeDropdown === item.name
                          ? "opacity-100 scale-y-100 translate-y-0"
                          : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                      }`}
                    >
                      <div className="py-2">
                        {item.submenu?.map((subItem) => (
                          <button
                            key={subItem.name}
                            onClick={() => handleLinkClick(subItem.name)}
                            className="block w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 hover:text-primary transition-colors duration-150"
                          >
                            {subItem.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Search and Cart */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              </div>

              <button className="relative p-2 text-gray-700 hover:text-primary transition-colors duration-200">
                <BsCart className="text-xl" />
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="btn btn-primary">S'inscrire</button>
            </div>

            {/* Mobile Menu Active */}
            <button
              className="lg:hidden p-2 text-gray-700 hover:text-primary transition-colors duration-200"
              onClick={() => setMobileMenuOpen(true)}
            >
              <FaBars className="text-xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-transparent backdrop-blur-sm z-50 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Mobile Menu Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
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
              <div className="py-4">
                {menuItems.map((item) => (
                  <div
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
                      <div
                        className={`bg-gray-50 border-t border-gray-200 overflow-hidden transition-all duration-300 ${
                          activeMobileSubmenu === item.name
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {item.submenu?.map((subItem) => (
                          <button
                            key={subItem.name}
                            onClick={() => handleLinkClick(subItem.name)}
                            className={`w-full text-left px-12 py-3 text-sm transition-colors duration-200 ${
                              activeLink === subItem.name
                                ? "text-primary bg-primary/10"
                                : "text-gray-600 hover:text-primary hover:bg-primary/10"
                            }`}
                          >
                            {subItem.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton de connexion fixe en bas */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium">
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
