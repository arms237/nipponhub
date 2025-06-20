'use client'
import Link from "next/link";
import React, { useState } from "react";
import { StaticImageData } from "next/image";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/app/contexts/CartContext";
import { productType } from "@/app/types/types";

export default function Product({
  imgSrc,
  alt,
  title,
  description,
  price,
  id,
  stock
}: {
  imgSrc: string | StaticImageData;
  alt: string;
  title: string;
  description: string;
  price: number;
  id: string;
  stock?: number;
}) {
  const { addToCart, canAddToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // Créer un objet produit temporaire pour la vérification
  const product: productType = {
    id,
    title,
    description,
    price,
    imgSrc: imgSrc as string,
    category: "",
    manga: "",
    stock: stock || 0,
    country: "",
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

  return (
    <div className="relative">
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
            />
          </div>
          <div className="flex flex-col items-center p-4">
            <h2 className="text-lg font-semibold text-center line-clamp-1">{title}</h2>
            <p className="line-clamp-1 text-center w-3/4 text-sm text-gray-600">
              {description}
            </p>
          </div>
        </Link>

        <div className="text-center p-4 w-full">
          <p className="font-bold text-xl text-secondary mb-2">{price.toLocaleString()} FCFA</p>
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
