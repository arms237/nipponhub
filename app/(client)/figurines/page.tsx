'use client';
import React, { useEffect, useState } from 'react';
import { products } from '@/app/product';
import { productType } from '@/app/types/types';
import ProductList from '@/components/ui/ProductList';
import { useFilters } from '@/app/contexts/FilterContext';
import { motion } from 'framer-motion';

const Figurines = () => {
  const [productsList, setProductsList] = useState<productType[]>([]);
  const { maxPrice } = useFilters();

  useEffect(() => {
    const filteredProducts = products.filter(
      product => product.cathegory === 'figurines' && product.price <= maxPrice
    );
    setProductsList(filteredProducts);
  }, [maxPrice]);

  if (productsList.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[60vh]  bg-base-100 p-8 rounded-lg mx-auto my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">Aucun produit trouvé</h2>
          <p className="text-gray-600">Aucune figurine ne correspond à vos critères de recherche.</p>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Réinitialiser les filtres
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Nos Figurines</h1>
        <div className="w-24 h-1 bg-primary mx-auto"></div>
      </div>
      
      <ProductList products={productsList} />
      
      {productsList.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            {productsList.length} {productsList.length > 1 ? 'figurines trouvées' : 'figurine trouvée'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default Figurines;