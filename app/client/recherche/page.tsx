'use client'
import { useSearchParams } from 'next/navigation';
import { useFilters } from '@/app/contexts/FilterContext';
import Loading from '@/app/loading';
import NoProductFound from '@/components/ui/NoProductFound';
import ProductView from '@/components/ui/ProductView';
import Pagination from '@/components/ui/Pagination';
import { usePagination } from '@/app/hooks/usePagination';
import Link from 'next/link';

export default function Recherche() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const { maxPrice, isInStock } = useFilters();

  // Utiliser le hook de pagination
  const {
    products: productsList,
    loading: isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage
  } = usePagination({
    searchQuery: query,
    maxPrice,
    isInStock,
    itemsPerPage: 12
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold text-error mb-4">
          Erreur de chargement
        </h1>
        <p className="text-gray-600 mb-6">
          {error}
        </p>
        <Link href="/" className="btn btn-primary">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  if (!query || productsList.length === 0) {
    return <NoProductFound />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="w-full md:w-3/4 mx-auto">
        <ProductView 
          productsList={productsList} 
          title={query === '*' ? "Tous nos produits" : `Résultats pour "${query}"`} 
        />
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}
