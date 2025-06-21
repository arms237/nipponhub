import { useState, useEffect } from 'react';
import { productType } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';

export const useRandomProducts = (limit: number = 8) => {
  const [products, setProducts] = useState<productType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('useRandomProducts - Début de la récupération des produits');
        
        // Récupérer les produits les plus récents au lieu de produits aléatoires
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
          .order('created_at', { ascending: false }) // Plus récents en premier
          .limit(limit + 5); // Prendre un peu plus pour avoir de la marge

        if (supabaseError) {
          console.error('Erreur lors de la récupération des produits:', supabaseError);
          setError('Erreur lors du chargement des produits');
          return;
        }

        console.log('useRandomProducts - Produits récupérés de Supabase:', data?.length || 0);

        if (!data || data.length === 0) {
          console.log('useRandomProducts - Aucun produit trouvé dans la base de données');
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

          // Vérifier que les données essentielles sont présentes
          if (!transformed.title || !transformed.imgSrc) {
            console.warn('useRandomProducts - Produit avec données manquantes:', transformed.id, transformed.title, transformed.imgSrc);
          }
          
          return transformed;
        });

        console.log('useRandomProducts - Produits transformés:', transformedData.length);

        // Filtrer les produits avec des données valides
        const validProducts = transformedData.filter(product => 
          product.title && 
          product.imgSrc && 
          product.price !== undefined && 
          product.price !== null
        );

        console.log('useRandomProducts - Produits valides:', validProducts.length);

        if (validProducts.length === 0) {
          console.log('useRandomProducts - Aucun produit valide trouvé');
          setProducts([]);
          return;
        }

        // Prioriser les produits en promotion, puis par date de création
        const prioritizedProducts = validProducts.sort((a, b) => {
          // D'abord par promotion (produits en promotion en premier)
          if (a.isOnSale && !b.isOnSale) return -1;
          if (!a.isOnSale && b.isOnSale) return 1;
          
          // Si les deux sont en promotion, prioriser par pourcentage de réduction (plus élevé en premier)
          if (a.isOnSale && b.isOnSale) {
            if (a.discountPercentage > b.discountPercentage) return -1;
            if (a.discountPercentage < b.discountPercentage) return 1;
          }
          
          // Puis par date de création (plus récents en premier)
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });

        // Prendre les premiers 'limit' produits valides (déjà triés par priorité)
        const selectedProducts = prioritizedProducts.slice(0, limit);
        
        console.log('useRandomProducts - Produits sélectionnés:', selectedProducts.length);
        console.log('useRandomProducts - Produits finaux:', selectedProducts.map(p => ({ id: p.id, title: p.title, created_at: p.created_at })));
        
        setProducts(selectedProducts);
      } catch (err) {
        console.error('Erreur inattendue:', err);
        setError('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  return { products, loading, error };
}; 