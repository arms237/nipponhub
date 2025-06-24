import React from 'react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onNextPage,
  onPrevPage
}: AdminPaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Générer les numéros de page à afficher (max 5 pages)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si il y en a 5 ou moins
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Si plus de 5 pages, afficher intelligemment
      if (currentPage <= 3) {
        // Au début : afficher 1, 2, 3, 4, 5
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // À la fin : afficher les 5 dernières pages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Au milieu : afficher 2 pages avant, la page actuelle, 2 pages après
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
      <div className="text-sm text-gray-500">
        Affichage de <span className="font-medium">{startItem}</span> à{" "}
        <span className="font-medium">{endItem}</span> sur{" "}
        <span className="font-medium">{totalCount}</span>{" "}
        résultats
      </div>
      <div className="join">
        <button 
          className="join-item btn btn-sm btn-ghost" 
          disabled={!hasPrevPage}
          onClick={onPrevPage}
        >
          Précédent
        </button>
        
        {/* Numéros de page */}
        {getPageNumbers().map((page) => (
          <button
            key={page}
            className={`join-item btn btn-sm ${
              currentPage === page ? 'btn-active' : 'btn-ghost'
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        
        <button 
          className="join-item btn btn-sm btn-ghost" 
          disabled={!hasNextPage}
          onClick={onNextPage}
        >
          Suivant
        </button>
      </div>
    </div>
  );
} 