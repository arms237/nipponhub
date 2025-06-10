'use client';
import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import { productType } from "@/app/types/types";
import Product from "./Product";

interface ProductListProps {
  products: productType[];
  limit?: number;
}

export default function ProductList({ products, limit }: ProductListProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  // État pour stocker le pays
  const [country, setCountry] = useState<string>('');
  
  // Récupérer le pays depuis le localStorage au chargement du composant
  useEffect(() => {
    // Vérifier si on est côté client avant d'accéder à localStorage
    if (typeof window !== 'undefined') {
      const savedCountry = localStorage.getItem('country');
      if (savedCountry) {
        setCountry(savedCountry);
      }
    }
  }, []);
  
  // Filtrer les produits en fonction du pays
  const filteredProducts = country 
    ? products.filter(product => product.pays === country)
    : products;
    
  // Appliquer la limite si elle est définie
  const displayedProducts = limit 
    ? filteredProducts.slice(0, limit)
    : filteredProducts;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      } 
    }
  };

  useEffect(() => {
    if (inView) {
      controls.start("show");
    }
  }, [controls, inView]);

  return (
    <div ref={ref} className="flex flex-col justify-center gap-4 md:w-3/4 w-full mx-auto">
      {displayedProducts.length === 0 ? (
        <div className="text-center py-10 col-span-full">
          <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 cursor-pointer m-auto mt-8 w-full"
          variants={container}
          initial="hidden"
          animate={controls}
        >
          {displayedProducts.map((product) => (
            <motion.div variants={item} key={product.id}>
              <Product
                id={Number(product.id)}
                imgSrc={product.imgSrc}
                alt={product.title}
                title={product.title}
                description={product.description}
                price={product.price}
                stock={product.stock}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
