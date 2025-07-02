import { useState, useEffect, useCallback } from 'react';
import { productType, VariationOptionType, VariantType } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';

interface UsePaginationOptions {
  itemsPerPage?: number;
  category?: string;
  subCategory?: string;
  searchQuery?: string;
  maxPrice?: number;
  isInStock?: boolean;
}

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

function mapVariation(variation: {
  id: string;
  name: string;
  variants: VariantType[];
}): VariationOptionType {
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

export const usePagination = (options: UsePaginationOptions = {}) => {
  const {
    itemsPerPage = 12,
    category,
    subCategory,
    searchQuery,
    maxPrice = 1000000,
    isInStock = false
  } = options;

  const [products, setProducts] = useState<productType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Calculer l'offset pour la pagination
      const offset = (page - 1) * itemsPerPage;

      // Construire la requête de base
      let query = supabase.from('products').select('*', { count: 'exact' });

      // Appliquer les filtres
      if (category) {
        query = query.eq('category', category);
      }

      if (subCategory) {
        query = query.eq('sub_category', subCategory);
      }

      if (searchQuery && searchQuery !== '*') {
        query = query.or(`title.ilike.%${searchQuery}%,manga.ilike.%${searchQuery}%`);
      }

      if (maxPrice < 1000000) {
        query = query.lte('price', maxPrice);
      }

      if (isInStock) {
        query = query.gt('stock', 0);
      }

      // Récupérer le nombre total d'éléments
      const { count } = await query;
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

      // Récupérer les produits pour la page actuelle
      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (fetchError) {
        console.error('Erreur lors de la récupération des produits:', fetchError);
        setError('Erreur lors du chargement des produits');
        return;
      }

      // Transformer les données
      const transformedData = (data || []).map(mapProduct).sort((a, b) => {
        // Prioriser les produits en promotion
        if (a.is_on_sale && !b.is_on_sale) return -1;
        if (!a.is_on_sale && b.is_on_sale) return 1;
        
        // Si les deux sont en promotion, prioriser par pourcentage de réduction
        if (a.is_on_sale && b.is_on_sale) {
          if (a.discount_percentage && b.discount_percentage && a.discount_percentage > b.discount_percentage) return -1;
          if (a.discount_percentage && b.discount_percentage && a.discount_percentage < b.discount_percentage) return 1;
        }
        
        // Puis par date de création (plus récents en premier)
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      setProducts(transformedData);
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, category, subCategory, searchQuery, maxPrice, isInStock]);

  // Charger les produits quand les options changent
  useEffect(() => {
    setCurrentPage(1); // Reset à la première page
    fetchProducts(1);
  }, [fetchProducts]);

  // Charger les produits quand la page change
  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll vers le haut de la page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    refetch: () => fetchProducts(currentPage)
  };
}; 