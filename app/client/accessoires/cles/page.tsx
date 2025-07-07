'use client'
import React from 'react';
import { usePagination } from '@/app/hooks/usePagination';
import Loading from '@/app/loading';
import NoProductFound from '@/components/ui/NoProductFound';
import ProductView from '@/components/ui/ProductView';
import Pagination from '@/components/ui/Pagination';

export default function Cles() {
  // Utiliser le hook usePagination pour récupérer les produits de la sous-catégorie "porte-clés"
  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage
  } = usePagination({
    subCategory: 'Porte-clés',
    itemsPerPage: 12
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
     
      
      {products.length === 0 ? (
        <NoProductFound />
      ) : (
        <div className="flex flex-col w-full">
          <ProductView 
            productsList={products}
            title="Porte-clés"
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 mb-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
          
          {/* Informations sur le nombre de produits */}
          <div className="text-center mt-4 mb-8">
            <p className="text-gray-600">
              {totalItems} {totalItems > 1 ? 'porte-clés trouvés' : 'porte-clé trouvé'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
