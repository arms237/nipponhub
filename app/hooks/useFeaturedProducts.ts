import { useState, useEffect } from 'react';
import { productType } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';

export const useFeaturedProducts = (limit: number = 8) => {
  const [products, setProducts] = useState<productType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('useFeaturedProducts - Début de la récupération des produits en vedette');
        
        // Stratégie 1: Essayer de récupérer les produits les plus récents avec stock
        let { data, error: supabaseError } = await supabase
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
          .gt('stock', 0) // Produits en stock
          .order('created_at', { ascending: false })
          .limit(limit);

        // Si pas assez de produits en stock, récupérer tous les produits récents
        if (!data || data.length < limit) {
          console.log('useFeaturedProducts - Pas assez de produits en stock, récupération de tous les produits récents');
          
          const { data: allData, error: allError } = await supabase
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
            .order('created_at', { ascending: false })
            .limit(limit + 10);

          if (allError) {
            console.error('Erreur lors de la récupération de tous les produits:', allError);
            setError('Erreur lors du chargement des produits');
            return;
          }

          data = allData;
        }

        if (supabaseError) {
          console.error('Erreur lors de la récupération des produits:', supabaseError);
          setError('Erreur lors du chargement des produits');
          return;
        }

        console.log('useFeaturedProducts - Produits récupérés de Supabase:', data?.length || 0);

        if (!data || data.length === 0) {
          console.log('useFeaturedProducts - Aucun produit trouvé dans la base de données');
          setProducts([]);
          return;
        }

        // Transformer les données
        const transformedData = data.map(product => {
          const transformed = {
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
          
          return transformed;
        });

        console.log('useFeaturedProducts - Produits transformés:', transformedData.length);

        // Filtrer les produits avec des données valides
        const validProducts = transformedData.filter(product => 
          product.title && 
          product.imgSrc && 
          product.price !== undefined && 
          product.price !== null &&
          product.title.trim() !== '' &&
          product.imgSrc.trim() !== ''
        );

        console.log('useFeaturedProducts - Produits valides:', validProducts.length);

        if (validProducts.length === 0) {
          console.log('useFeaturedProducts - Aucun produit valide trouvé');
          setProducts([]);
          return;
        }

        // Prioriser les produits en promotion, puis en stock, puis par date de création
        const prioritizedProducts = validProducts.sort((a, b) => {
          // D'abord par promotion (produits en promotion en premier)
          if (a.isOnSale && !b.isOnSale) return -1;
          if (!a.isOnSale && b.isOnSale) return 1;
          
          // Si les deux sont en promotion, prioriser par pourcentage de réduction (plus élevé en premier)
          if (a.isOnSale && b.isOnSale) {
            if (a.discountPercentage > b.discountPercentage) return -1;
            if (a.discountPercentage < b.discountPercentage) return 1;
          }
          
          // Puis par stock (produits en stock en premier)
          if (a.stock > 0 && b.stock === 0) return -1;
          if (a.stock === 0 && b.stock > 0) return 1;
          
          // Puis par date de création (plus récents en premier)
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });

        // Prendre les premiers 'limit' produits
        const selectedProducts = prioritizedProducts.slice(0, limit);
        
        console.log('useFeaturedProducts - Produits sélectionnés:', selectedProducts.length);
        console.log('useFeaturedProducts - Produits finaux:', selectedProducts.map(p => ({ 
          id: p.id, 
          title: p.title, 
          stock: p.stock,
          created_at: p.created_at,
          isOnSale: p.isOnSale,
          discountPercentage: p.discountPercentage
        })));
        
        setProducts(selectedProducts);
      } catch (err) {
        console.error('Erreur inattendue:', err);
        setError('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [limit]);

  return { products, loading, error };
}; 