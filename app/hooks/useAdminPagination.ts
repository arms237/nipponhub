import { useState, useEffect } from 'react';
import supabase from '@/app/lib/supabaseClient';

interface PaginationOptions {
  table: string;
  pageSize?: number;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, string | number | boolean | undefined | null>;
  searchColumn?: string;
  searchTerm?: string;
}

interface PaginationResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => void;
}

export function useAdminPagination<T>({
  table,
  pageSize = 10,
  select = '*',
  orderBy = { column: 'created_at', ascending: false },
  filters = {},
  searchColumn,
  searchTerm
}: PaginationOptions): PaginationResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Construire la requête de base
      let query = supabase
        .from(table)
        .select(select, { count: 'exact' });

      // Appliquer les filtres
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'string' && value.includes('%')) {
            query = query.ilike(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Appliquer la recherche si spécifiée
      if (searchColumn && searchTerm) {
        query = query.ilike(searchColumn, `%${searchTerm}%`);
      }

      // Appliquer le tri
      query = query.order(orderBy.column, { ascending: orderBy.ascending });

      // Appliquer la pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: result, error, count } = await query;

      if (error) {
        throw error;
      }

      if (Array.isArray(result) && !(result as any)[0]?.message) {
        setData(result as T[]);
      } else {
        setData([]);
      }
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur de pagination:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, JSON.stringify(filters), searchTerm]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const refresh = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    refresh
  };
} 