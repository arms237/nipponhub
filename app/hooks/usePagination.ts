import { useState, useEffect } from 'react';
import { productType } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';

interface UsePaginationOptions {
  itemsPerPage?: number;
  category?: string;
  subCategory?: string;
  searchQuery?: string;
  maxPrice?: number;
  isInStock?: boolean;
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

  const fetchProducts = async (page: number = 1) => {
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
      const transformedData = (data || []).map((product: any) => {
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
        };
      }).sort((a, b) => {
        // Prioriser les produits en promotion
        if (a.isOnSale && !b.isOnSale) return -1;
        if (!a.isOnSale && b.isOnSale) return 1;
        
        // Si les deux sont en promotion, prioriser par pourcentage de réduction
        if (a.isOnSale && b.isOnSale) {
          if (a.discountPercentage > b.discountPercentage) return -1;
          if (a.discountPercentage < b.discountPercentage) return 1;
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
  };

  // Charger les produits quand les options changent
  useEffect(() => {
    setCurrentPage(1); // Reset à la première page
    fetchProducts(1);
  }, [category, subCategory, searchQuery, maxPrice, isInStock]);

  // Charger les produits quand la page change
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

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