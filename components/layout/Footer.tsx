import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaPhone, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-200 text-base-content mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">NipponHub</h2>
            <p className="text-sm">Votre destination préférée pour les produits dérivés de manga et d&apos;anime japonais.</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li><Link href="/client" className="hover:text-primary transition-colors">Accueil</Link></li>
              <li><Link href="/client/recherche?query=*" className="hover:text-primary transition-colors">Boutique</Link></li>
              <li><Link href="/client/evenements" className="hover:text-primary transition-colors">Evènements</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Promotions</Link></li>
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Catégories</h3>
            <ul className="space-y-2">
              <li><Link href="/client/figurines" className="hover:text-primary transition-colors">Figurines</Link></li>
              <li><Link href="/client/vetements" className="hover:text-primary transition-colors">Vêtements</Link></li>
              <li><Link href="/client/accessoires" className="hover:text-primary transition-colors">Accessoires</Link></li>
              <li><Link href="/client/cles" className="hover:text-primary transition-colors">Porte-clés</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <FaPhone className="mr-2 text-primary" />
                <a href="tel:+237658849218" className="hover:text-primary transition-colors">+237658849218</a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2 text-primary" />
                <a href="mailto:nipponhub0237@gmail.com" className="hover:text-primary transition-colors">nipponhub0237@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-base-300 mt-12 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {currentYear} NipponHub. Tous droits réservés.</p>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
