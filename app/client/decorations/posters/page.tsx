'use client'
import React, { useEffect, useState } from 'react';
import supabase from '@/app/lib/supabaseClient';
import { useFilters } from '@/app/contexts/FilterContext';
import { productType } from '@/app/types/types';
import Loading from '@/app/loading';
import NoProductFound from '@/components/ui/NoProductFound';
import ProductView from '@/components/ui/ProductView';

export default function Posters() {
  const [productsList, setProductsList] = useState<productType[]>([]);
  const { maxPrice, isInStock } = useFilters();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sub_category', 'Posters');
      if (error) {
        setProductsList([]);
      } else {
        let result = (data || []).map((product: any) => ({
          ...product,
          imgSrc: product.img_src,
          infoProduct: product.info_product,
          sub_category: product.sub_category,
          created_at: product.created_at,
          updated_at: product.updated_at,
        }));
        result = result.filter(product => product.price <= maxPrice);
        if (isInStock) {
          result = result.filter(product => product.stock > 0);
        }
        setProductsList(result);
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, [maxPrice, isInStock]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loading />
      </div>
    );
  }

  if (productsList.length === 0) {
    return <NoProductFound />;
  }

  return (
    <ProductView productsList={productsList} title="Posters" />
  );
} 