import { useState, useEffect } from 'react';
import { productType, VariationOptionType, VariantType } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';

function mapVariant(variant: {
  id: string;
  name: string;
  img_src?: string;
  price?: number;
  stock?: number;
  original_price?: number;
  discount_percentage?: number;
}): VariantType {
  return {
    id: variant.id,
    name: variant.name,
    img_src: variant.img_src ?? '',
    price: variant.price,
    stock: variant.stock,
    original_price: variant.original_price,
    discount_percentage: variant.discount_percentage,
  };
}

function mapVariation(variation: { id: string; name: string; variants: VariantType[] }): VariationOptionType {
  return {
    id: variation.id,
    name: variation.name,
    variants: (variation.variants || []).map(mapVariant),
  };
}

function mapProduct(product: productType): productType {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    original_price: product.original_price,
    discount_percentage: product.discount_percentage,
    is_on_sale: product.is_on_sale,
    sale_end_date: product.sale_end_date,
    manga: product.manga,
    img_src: product.img_src ?? '',
    image_file: undefined,
    category: product.category,
    sub_category: product.sub_category,
    info_product: product.info_product,
    stock: product.stock,
    variations: (product.variations || []).map(mapVariation),
    country: product.country,
    available_cities: product.available_cities,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

export function useRandomProducts(limit: number = 4) {
  const [products, setProducts] = useState<productType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandom = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`*, variations(*, variants(*))`)
          .order('RANDOM()', { ascending: true })
          .limit(limit);
        if (error) throw error;
        setProducts((data || []).map(mapProduct));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };
    fetchRandom();
  }, [limit]);

  return { products, loading, error };
} 