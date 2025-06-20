'use client';
import React, { useEffect, useState } from 'react';
import supabase from '@/app/lib/supabaseClient';
import { productType } from '@/app/types/types';
import { useFilters } from '@/app/contexts/FilterContext';
import NoProductFound from '@/components/ui/NoProductFound';
import Loading from '@/app/loading';
import ProductView from '@/components/ui/ProductView';

const Figurines = () => {
  const [productsList, setProductsList] = useState<productType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { maxPrice, isInStock } = useFilters();

  useEffect(() => {
    setIsLoading(true);
    const fetchProducts = async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('category', 'Figurines')
        .lte('price', maxPrice)
        .range(0, 19);
      if (isInStock) {
        query = query.gt('stock', 0);
      }
      const { data, error } = await query;
      if (error) {
        setProductsList([]);
      } else {
        setProductsList(
          (data || []).map((product: any) => ({
            ...product,
            imgSrc: product.img_src,
            infoProduct: product.info_product,
            sub_category: product.sub_category,
            created_at: product.created_at,
            updated_at: product.updated_at,
          }))
        );
      }
      setIsLoading(false);
    };
    fetchProducts();
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
    <ProductView productsList={productsList} title="Nos Figurines" />
  );
};
export default Figurines;