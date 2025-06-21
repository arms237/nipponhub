import { useState, useEffect } from 'react';
import { productType } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';

export const useSimilarProducts = (currentProduct: productType | null, limit: number = 4) => {
  const [products, setProducts] = useState<productType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!currentProduct) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase
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
          .neq('id', currentProduct.id); // Exclure le produit actuel

        // Rechercher par catégorie ET manga pour plus de pertinence
        if (currentProduct.category && currentProduct.manga) {
          query = query.or(`category.eq.${currentProduct.category},manga.eq.${currentProduct.manga}`);
        } else if (currentProduct.category) {
          query = query.eq('category', currentProduct.category);
        } else if (currentProduct.manga) {
          query = query.eq('manga', currentProduct.manga);
        }

        const { data, error: supabaseError } = await query.limit(limit + 5); // Prendre un peu plus pour avoir de la marge

        if (supabaseError) {
          console.error('Erreur lors de la récupération des produits similaires:', supabaseError);
          setError('Erreur lors du chargement des produits similaires');
          return;
        }

        if (!data || data.length === 0) {
          setProducts([]);
          return;
        }

        // Transformer les données
        const transformedData = data.map(product => {
          return {
            ...product,
            imgSrc: product.img_src,
            infoProduct: product.info_product,
            sub_category: product.sub_category,
            created_at: product.created_at,
            updated_at: product.updated_at,
            // Gestion des promotions - utiliser les valeurs stockées en base
            isOnSale: product.is_on_sale || false,
            discountPercentage: product.discount_percentage || 0,
            saleEndDate: product.sale_end_date || null,
            originalPrice: product.original_price || product.price,
            variations: product.variations?.map((variation: any) => ({
              ...variation,
              variants: variation.variants?.map((variant: any) => ({
                ...variant,
                imgSrc: variant.img_src
              }))
            }))
          };
        });

        // Prioriser les produits qui correspondent à la fois à la catégorie ET au manga, puis par promotion
        const prioritizedProducts = transformedData.sort((a, b) => {
          const aMatchesBoth = a.category === currentProduct.category && a.manga === currentProduct.manga;
          const bMatchesBoth = b.category === currentProduct.category && b.manga === currentProduct.manga;
          
          // D'abord par correspondance exacte (catégorie ET manga)
          if (aMatchesBoth && !bMatchesBoth) return -1;
          if (!aMatchesBoth && bMatchesBoth) return 1;
          
          // Sinon, mélanger aléatoirement
          return 0.5 - Math.random();
        });

        // Prendre les premiers 'limit' produits
        const selectedProducts = prioritizedProducts.slice(0, limit);
        
        setProducts(selectedProducts);
      } catch (err) {
        console.error('Erreur inattendue:', err);
        setError('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [currentProduct, limit]);

  return { products, loading, error };
}; 