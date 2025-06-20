import { useState, useEffect } from 'react';
import { productType } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';

export const useProduct = (productId: string) => {
  const [product, setProduct] = useState<productType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
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
          .eq('id', productId)
          .single();

        if (supabaseError) {
          console.error('Erreur lors de la récupération du produit:', supabaseError);
          setError('Produit non trouvé');
          return;
        }

        if (!data) {
          setError('Produit non trouvé');
          return;
        }

        // Transformer les données
        const transformedProduct = {
          ...data,
          imgSrc: data.img_src,
          infoProduct: data.info_product,
          sub_category: data.sub_category,
          created_at: data.created_at,
          updated_at: data.updated_at,
          variations: data.variations?.map((variation: any) => ({
            ...variation,
            variants: variation.variants?.map((variant: any) => ({
              ...variant,
              imgSrc: variant.img_src
            }))
          }))
        };

        setProduct(transformedProduct);
      } catch (err) {
        console.error('Erreur inattendue:', err);
        setError('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}; 