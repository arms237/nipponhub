'use client'
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { StaticImageData } from "next/image";
import { FaShoppingCart } from "react-icons/fa";
import { FaTag } from "react-icons/fa";
import { useCart } from "@/app/contexts/CartContext";
import { productType } from "@/app/types/types";
import CityBadges from "./CityBadges";

export default function Product({
  imgSrc,
  alt,
  title,
  description,
  price,
  id,
  stock,
  original_price,
  discount_percentage,
  is_on_sale,
  saleEndDate,
  country,
  available_cities
}: {
  imgSrc: string | StaticImageData;
  alt: string;
  title: string;
  description: string;
  price: number;
  id: string;
  stock?: number;
  original_price?: number;
  discount_percentage?: number;
  is_on_sale?: boolean;
  saleEndDate?: string;
  country?: string;
  available_cities?: string[];
}) {
  const { addToCart, canAddToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // Vérifier les données reçues
  useEffect(() => {
    if (!title || !imgSrc || price === undefined || price === null) {
      console.warn('Product - Données manquantes:', { id, title, imgSrc, price });
    }
  }, [id, title, imgSrc, price]);

  // Créer un objet produit temporaire pour la vérification
  const product: productType = {
    id,
    title,
    description,
    price,
    original_price: original_price,
    discount_percentage: discount_percentage,
    is_on_sale: is_on_sale,
    sale_end_date: saleEndDate,
    img_src: imgSrc as string,
    category: "",
    manga: "",
    stock: stock || 0,
    country: country || "",
    created_at: "",
    updated_at: ""
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la navigation
    e.stopPropagation(); // Empêcher la propagation
    
    if (canAddToCart(product)) {
      addToCart(product);
      setIsAdded(true);
    } else {
      alert('Impossible d\'ajouter ce produit au panier (stock insuffisant ou limite atteinte)');
    }
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const isInStock = stock && stock > 0;

  // Si les données essentielles sont manquantes, ne pas afficher le produit
  if (!title || !imgSrc || price === undefined || price === null) {
    console.warn('Product - Produit ignoré à cause de données manquantes:', { id, title, imgSrc, price });
    return null;
  }

  // Calculer le temps restant pour la promotion
  const getTimeRemaining = () => {
    if (!saleEndDate) return null;
    
    const now = new Date();
    const endDate = new Date(saleEndDate);
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Promotion terminée";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "Bientôt fini";
  };

  const timeRemaining = getTimeRemaining();
  const isPromotionExpired = timeRemaining === "Promotion terminée";

  // Debug: afficher les informations de promotion
  useEffect(() => {
    if (is_on_sale) {
      console.log('Product Debug:', {
        id,
        title,
        is_on_sale,
        discount_percentage,
        saleEndDate,
        timeRemaining,
        isPromotionExpired,
        now: new Date().toISOString()
      });
    }
  }, [id, title, is_on_sale, discount_percentage, saleEndDate, timeRemaining, isPromotionExpired]);

  return (
    <div className="relative">
      {/* Badge de promotion */}
      {is_on_sale && discount_percentage && (
        <div className="absolute top-2 left-2 z-10">
          <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
            isPromotionExpired 
              ? 'bg-gray-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <FaTag />
            {isPromotionExpired ? 'Terminée' : `-${discount_percentage}%`}
          </div>
        </div>
      )}

      {/* Compte à rebours de la promotion */}
      {is_on_sale && timeRemaining && (
        <div className="absolute top-2 right-2 z-10">
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            isPromotionExpired 
              ? 'bg-gray-500 text-white' 
              : 'bg-orange-500 text-white'
          }`}>
            {timeRemaining}
          </div>
        </div>
      )}

      <div className={`absolute top-1/2 right-1/2 translate-x-1/2 translate-y-1/2 text-sm w-full border border-base-300 bg-base-100 bg-opacity-50 text-content p-2 rounded opacity-0 pointer-events-none transition-all duration-300 ${isAdded ? "opacity-100" : ""}`}>
        <p className="text-center flex items-center"><span className="inline-block mr-2 text-xl bg-green-500 text-white p-2 rounded-full"><FaShoppingCart/></span>Ajouté au panier</p>
      </div>
      <div className="pb-2 flex flex-col items-center bg-base-100 border border-base-300 rounded hover:scale-105 transition-transform duration-300">
        <Link href={`/client/product/${id}`} className="w-full">
          <div className="w-full">
            <img
              src={imgSrc as string}
              alt={alt}
              className="object-cover w-full"
              onError={(e) => {
                console.error('Product - Erreur de chargement image:', imgSrc);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col items-center p-4">
            <h2 className="text-lg font-semibold text-center line-clamp-1">{title}</h2>
            <p className="line-clamp-1 text-center w-3/4 text-sm text-gray-600">
              {description}
            </p>
            
            {/* Affichage des villes disponibles */}
            {country && available_cities && available_cities.length > 0 && (
              <div className="mt-2 w-full">
                <CityBadges 
                  cityIds={available_cities} 
                  country={country} 
                  className="justify-center"
                />
              </div>
            )}
          </div>
        </Link>

        <div className="text-center p-4 w-full">
          <div className="mb-2">
            {is_on_sale && original_price && (
              <p className={`text-sm line-through ${
                isPromotionExpired ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {original_price.toLocaleString()} FCFA
              </p>
            )}
            <p className={`font-bold text-xl ${
              is_on_sale && !isPromotionExpired ? 'text-red-500' : 'text-secondary'
            }`}>
              {price.toLocaleString()} FCFA
            </p>
            {isPromotionExpired && (
              <p className="text-xs text-gray-500 mt-1">
                Prix normal
              </p>
            )}
          </div>
          <button
            className={`btn text-center w-full ${isInStock ? 'btn-primary' : 'btn-disabled'}`}
            onClick={handleAddToCart}
            disabled={!isInStock}
          >
            <FaShoppingCart /> 
            {isInStock ? 'Ajouter au panier' : 'Rupture de stock'}
          </button>
        </div>
      </div>
    </div>
  );
}