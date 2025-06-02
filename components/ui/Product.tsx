'use client'
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import { StaticImageData } from "next/image";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/app/contexts/CartContext";

export default function Product({
  imgSrc,
  alt,
  title,
  description,
  price,
  id,
}: {
  imgSrc: string | StaticImageData;
  alt: string;
  title: string;
  description: string;
  price: number;
  id: number;
}) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const handleAddToCart = () => {
    addToCart({ id, title, price, description, imgSrc });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div className="relative">
      <div className={`absolute top-1/2 right-1/2 translate-x-1/2 translate-y-1/2 text-sm w-full border border-base-300 bg-base-100 bg-opacity-50 text-content p-2 rounded opacity-0 pointer-events-none transition-all duration-300 ${isAdded ? "opacity-100" : ""}`}>
        <p className="text-center flex items-center"><span className="inline-block mr-2 text-xl bg-green-500 text-white p-2 rounded-full"><FaShoppingCart/></span>Ajouté au panier</p>
      </div>
      <div className="pb-2 flex flex-col items-center bg-base-100 border border-base-300 rounded hover:scale-105 transition-transform duration-300">
        <Link href={`/product/${id}`}>
          <div>
            <Image
              src={imgSrc}
              alt={alt}
              width={300}
              height={300}
              className="object-cover "
            />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold text-center">{title}</h2>
            <p className="line-clamp-1 text-center w-3/4 text-sm text-gray-600">
              {description}
            </p>
          </div>
        </Link>

        <div className="text-center">
          <p className="font-bold text-xl text-secondary">{price} FCFA</p>
          <button
            className="btn btn-primary text-center"
            onClick={handleAddToCart}
          >
            <FaShoppingCart /> Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}
