// Custom hook for API data fetching - eliminates duplication across components
import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching data from API with loading and error states
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @param {array} dependencies - Array of dependencies to trigger refetch
 * @returns {object} - { data, loading, error, refetch }
 */
export function useApiData(url, options = {}, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('API fetch error:', err);
      setError(err.message || 'An error occurred while fetching data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Custom hook for POST/PUT/DELETE API requests
 * @returns {object} - { execute, loading, error, data }
 */
export function useApiMutation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (url, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      console.error('API mutation error:', err);
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, data };
}

/**
 * Paginated data fetching hook
 * @param {string} baseUrl - Base API endpoint URL
 * @param {number} initialPage - Initial page number
 * @param {number} limit - Items per page
 * @returns {object} - { data, loading, error, page, totalPages, nextPage, prevPage, setPage }
 */
export function usePaginatedData(baseUrl, initialPage = 1, limit = 12) {
  const [page, setPage] = useState(initialPage);
  const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}&limit=${limit}`;
  
  const { data, loading, error, refetch } = useApiData(url, {}, [page]);

  const nextPage = () => {
    if (data?.pagination?.currentPage < data?.pagination?.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  return {
    data: data?.events || data?.items || [],
    pagination: data?.pagination,
    loading,
    error,
    page,
    totalPages: data?.pagination?.totalPages || 1,
    nextPage,
    prevPage,
    setPage,
    refetch,
  };
}
