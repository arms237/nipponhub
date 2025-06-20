import { useState, useEffect } from 'react';
import { productType } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';

export const useRandomProducts = (limit: number = 8) => {
  const [products, setProducts] = useState<productType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Récupérer un maximum de 30 produits pour limiter la charge
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select(`
            *,
            variations (
              id,
              name,
              variants (
                id,
                name,
                price,
                stock,
                img_src
              )
            )
          `)
          .limit(30);

        if (supabaseError) {
          console.error('Erreur lors de la récupération des produits:', supabaseError);
          setError('Erreur lors du chargement des produits');
          return;
        }

        if (!data || data.length === 0) {
          setProducts([]);
          return;
        }

        // Transformer les données
        const transformedData = data.map(product => ({
          ...product,
          imgSrc: product.img_src,
          infoProduct: product.info_product,
          sub_category: product.sub_category,
          created_at: product.created_at,
          updated_at: product.updated_at,
          variations: product.variations?.map((variation: any) => ({
            ...variation,
            variants: variation.variants?.map((variant: any) => ({
              ...variant,
              imgSrc: variant.img_src
            }))
          }))
        }));

        // Mélanger aléatoirement et prendre les premiers 'limit' produits
        const shuffled = transformedData.sort(() => 0.5 - Math.random());
        const selectedProducts = shuffled.slice(0, limit);
        
        setProducts(selectedProducts);
      } catch (err) {
        console.error('Erreur inattendue:', err);
        setError('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomProducts();
  }, [limit]);

  return { products, loading, error };
}; 