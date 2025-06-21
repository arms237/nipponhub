"use client";

import { useState, useEffect } from 'react';
import { productType } from '@/app/types/types';
import supabase from '@/app/lib/supabaseClient';
import Product from '@/components/ui/Product';
import Loading from '@/app/loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import TitleCategory from '@/components/ui/TitleCategory';

export default function ClesPage() {
  const [products, setProducts] = useState<productType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    inStock: false
  });

  useEffect(() => {
    const fetchProducts = async () => {
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
          .eq('category', 'accessoires')
          .eq('sub_category', 'cles');

        // Appliquer les filtres
        if (filters.minPrice) {
          query = query.gte('price', parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
          query = query.lte('price', parseFloat(filters.maxPrice));
        }
        if (filters.inStock) {
          query = query.gt('stock', 0);
        }

        const { data, error: supabaseError } = await query.order('created_at', { ascending: false });

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
            originalPrice: product.original_price || product.price, // Utiliser le prix original stocké ou le prix actuel
            variations: product.variations?.map((variation: any) => ({
              ...variation,
              variants: variation.variants?.map((variant: any) => ({
                ...variant,
                imgSrc: variant.img_src
              }))
            }))
          };
        });

        setProducts(transformedData);
      } catch (err) {
        console.error('Erreur inattendue:', err);
        setError('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (filterType: string, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      inStock: false
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <TitleCategory 
          title="Porte-clés" 
        />

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Prix min:</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0"
                className="border border-gray-300 rounded-md px-3 py-1 text-sm w-20"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Prix max:</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="∞"
                className="border border-gray-300 rounded-md px-3 py-1 text-sm w-20"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inStock"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                En stock uniquement
              </label>
            </div>

            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-primary-dark underline"
            >
              Effacer les filtres
            </button>
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-4">
          <p className="text-gray-600">
            {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Liste des produits */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <Product
                key={product.id}
                id={product.id}
                imgSrc={Array.isArray(product.imgSrc) ? product.imgSrc[0] : product.imgSrc}
                alt={product.title}
                title={product.title}
                description={product.description}
                price={product.price}
                stock={product.stock}
                originalPrice={product.originalPrice}
                discountPercentage={product.discountPercentage}
                isOnSale={product.isOnSale}
                saleEndDate={product.saleEndDate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun porte-clé trouvé
            </h3>
            <p className="text-gray-600">
              Aucun produit ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
