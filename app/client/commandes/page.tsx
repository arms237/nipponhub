'use client';

import { useState } from 'react';
import TitleCategory from "@/components/ui/TitleCategory";
import { FaPhoneAlt, FaMapMarkerAlt, FaCity, FaGlobeAfrica, FaShoppingCart } from 'react-icons/fa';
import { FaCircleUser } from "react-icons/fa6";
import { IoMailSharp } from "react-icons/io5";
import { useCart } from '@/app/contexts/CartContext';
import { ClientOrderForm } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';
import Image from 'next/image';

const COUNTRIES = [
'Cameroun',
'Gabon'
];

export default function Commande() {
  const { cartItems} = useCart();
  
  // Calcul du total du panier
  const total = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const [formData, setFormData] = useState<ClientOrderForm>({
    email: '',
    username: '',
    phone: '',
    address: '',
    city: '',
    country: 'Cameroun',
    notes: ''
  });
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [orderSaved, setOrderSaved] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    // On prépare le payload sans l'id (il sera généré par Supabase)
    const payload = {
      ...formData,
      cart_items: JSON.parse(JSON.stringify(cartItems)),
      order_link: '' // temporaire, sera mis à jour après
    };
    console.log('Payload envoyé à Supabase:', payload);

    // Enregistre la commande dans Supabase et récupère l'id
    const { data, error } = await supabase
      .from('client_orders')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      alert('Erreur lors de la sauvegarde de la commande.');
      return;
    }

    const createdOrderId = data.id;
    setOrderId(createdOrderId);
    const suiviLink = `${window.location.origin}/client/commandeVue/${createdOrderId}`;

    // Génère le message WhatsApp avec le lien de suivi
    const message = encodeURIComponent(
      `Bonjour, je souhaite valider cette commande :\n` +
      cartItems.map(item => `- ${item.title} x${item.quantity}`).join('\n') +
      `\nTotal : ${total} FCFA\nNom : ${formData.username}\nTéléphone : ${formData.phone}\nSuivi : ${suiviLink}`
    );

    // Choix du numéro selon le pays
    const phoneNumber = formData.country === 'Gabon' ? '24106055957' : '237658849218';
    const waLink = `https://wa.me/${phoneNumber}?text=${message}`;

    // Met à jour la commande avec le lien de suivi (order_link)
    await supabase.from('client_orders').update({ order_link: suiviLink }).eq('id', createdOrderId);

    setWhatsappLink(waLink);
    setOrderSaved(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TitleCategory title="Finaliser votre commande" />
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Formulaire */}
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de contact */}
            <div className="bg-base-100 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Informations de contact</h2>
              <div className="space-y-4">
                <label className="input input-bordered flex items-center gap-2">
                  <IoMailSharp className="text-primary" />
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    className="grow" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </label>
                
                <label className="input input-bordered flex items-center gap-2">
                  <FaCircleUser className="text-primary" />
                  <input 
                    type="text" 
                    name="username" 
                    placeholder="Nom complet" 
                    className="grow"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                
                <label className="input input-bordered flex items-center gap-2">
                  <FaPhoneAlt className="text-primary" />
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="Téléphone" 
                    className="grow"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              </div>
            </div>
            
            {/* Adresse de livraison */}
            <div className="bg-base-100 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Adresse de livraison</h2>
              <div className="space-y-4">
                <label className="input input-bordered flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary" />
                  <input 
                    type="text" 
                    name="address" 
                    placeholder="Adresse" 
                    className="grow"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="input input-bordered flex items-center gap-2">
                    <FaCity className="text-primary" />
                    <input 
                      type="text" 
                      name="city" 
                      placeholder="Ville" 
                      className="grow"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  
                  <div className="form-control">
                    <div className="input input-bordered flex items-center gap-2">
                      <FaGlobeAfrica className="text-primary" />
                      <select 
                        name="country" 
                        className="w-full bg-transparent"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      >
                        {COUNTRIES.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="form-control">
                  <label className="label">
                   
                  </label>
                  <textarea 
                    name="notes" 
                    className="textarea textarea-bordered h-24" 
                    placeholder="Notes concernant votre commande..."
                    value={formData.notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="lg:hidden">
              <button type="submit" className="btn btn-primary w-full">
                Passer la commande
              </button>
            </div>
          </form>
          {orderSaved && whatsappLink && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                Recevoir ma commande sur WhatsApp
              </a>
              {orderId && (
                <a
                  href={`/client/commandeVue/${orderId}`}
                  className="btn btn-outline mt-2"
                >
                  Voir ma commande en ligne
                </a>
              )}
              <span className="text-sm text-gray-500">Cliquez pour ouvrir WhatsApp et envoyer votre commande.</span>
            </div>
          )}
        </div>
        
        {/* Récapitulatif de la commande */}
        <div className="lg:w-1/3">
          <div className="bg-base-100 p-6 rounded-lg shadow-sm sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaShoppingCart className="text-primary" />
              Votre commande
            </h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4">
                    <div className="avatar">
                      <div className="w-16 h-16 rounded bg-base-200 relative">
                        {item.img_src && (
                          <Image 
                            src={item.img_src} 
                            alt={item.title} 
                            width={128}
                            height={128}
                            className="object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <div className="text-sm text-gray-500">
                        Quantité: {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">
                      {item.price.toLocaleString()} FCFA
                    </div>
                  </div>
                ))
              ) : (
                <p>Votre panier est vide</p>
              )}
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>À calculer</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                <span>Total</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
            </div>
            
            <div className="mt-6 hidden lg:block">
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('form')?.requestSubmit();
                }}
                disabled={cartItems.length === 0}
              >
                Passer la commande
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              En passant votre commande, vous acceptez nos conditions générales de vente.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
