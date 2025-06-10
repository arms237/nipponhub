'use client';
import React, { useEffect, useState } from 'react';
import { products } from '@/app/product';
import { productType } from '@/app/types/types';
import ProductList from '@/components/ui/ProductList';
import { useFilters } from '@/app/contexts/FilterContext';
import NoProductFound from '@/components/ui/NoProductFound';
import TitleCategory from '@/components/ui/TitleCategory';
import Loading from '@/app/loading';

const Figurines = () => {
  const [productsList, setProductsList] = useState<productType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { maxPrice, isInStock } = useFilters();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      let result = products.filter(
        product => product.cathegory === 'figurines' && product.price <= maxPrice
      );
      
      if (isInStock) {
        result = result.filter(product => product.stock > 0);
      }
      
      setProductsList(result);
      setIsLoading(false);
    }, 100);// Simulation delai de chargement a enlever lorsque je ferai le backend

    return () => clearTimeout(timer);
  }, [maxPrice, isInStock]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen w-full'>
      <Loading/>
      </div>
    );
  }

  if (productsList.length === 0) {
    return <NoProductFound />;
  }

  return (
    <div className='flex flex-col'>
      <TitleCategory title="Nos Figurines" />
      <ProductList products={productsList} />
      <div className="text-center mt-4">
        <p className="text-gray-600">
          {productsList.length} {productsList.length > 1 ? 'figurines trouvées' : 'figurine trouvée'}
        </p>
      </div>
    </div>
  );
};
export default Figurines;