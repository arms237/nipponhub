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
          .gt('stock', 0) // Produits en stock
          .order('created_at', { ascending: false })
          .limit(limit);

        let finalData = data;
        // Si pas assez de produits en stock, récupérer tous les produits récents
        if (!finalData || finalData.length < limit) {
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

          finalData = allData;
        }

        if (supabaseError) {
          console.error('Erreur lors de la récupération des produits:', supabaseError);
          setError('Erreur lors du chargement des produits');
          return;
        }

        console.log('useFeaturedProducts - Produits récupérés de Supabase:', finalData?.length || 0);

        if (!finalData || finalData.length === 0) {
          console.log('useFeaturedProducts - Aucun produit trouvé dans la base de données');
          setProducts([]);
          return;
        }

        // Transformer les données
        const transformedData = (finalData as productType[]).map(mapProduct);

        console.log('useFeaturedProducts - Produits transformés:', transformedData.length);

        // Filtrer les produits avec des données valides
        const validProducts = transformedData.filter(product => 
          product.title && 
          product.img_src && 
          product.price !== undefined && 
          product.price !== null &&
          product.title.trim() !== '' &&
          product.img_src.trim() !== ''
        );


        if (validProducts.length === 0) {
          console.log('useFeaturedProducts - Aucun produit valide trouvé');
          setProducts([]);
          return;
        }

        // Prioriser les produits en promotion, puis en stock, puis par date de création
        const prioritizedProducts = validProducts.sort((a, b) => {
          // D'abord par promotion (produits en promotion en premier)
          if (a.is_on_sale && !b.is_on_sale) return -1;
          if (!a.is_on_sale && b.is_on_sale) return 1;
          // Si les deux sont en promotion, prioriser par pourcentage de réduction (plus élevé en premier)
          if (a.is_on_sale && b.is_on_sale) {
            const aDiscount = a.discount_percentage ?? 0;
            const bDiscount = b.discount_percentage ?? 0;
            if (aDiscount > bDiscount) return -1;
            if (aDiscount < bDiscount) return 1;
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