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
        const transformedData = (data as productType[]).map(mapProduct);

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