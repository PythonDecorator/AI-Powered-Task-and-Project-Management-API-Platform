import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '../../utils/helpers/http.js';
import PropTypes from 'prop-types';

const INITIAL_PAGE_SIZE = 10;
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Query key factory for proper React Query cache management
 */
const createQueryKey = (url, paginationModel, sortModel, filterModel) => [
  'crud-table',
  url,
  paginationModel,
  sortModel,
  filterModel,
];

/**
 * Build query parameters from DataGrid models
 */
const buildQueryParams = ({ paginationModel, sortModel, filterModel }) => {
  const params = {};

  // Pagination: page is 0-indexed in DataGrid, convert to 1-indexed for API
  if (paginationModel) {
    params.page = (paginationModel.page ?? 0) + 1;
    params.page_size = paginationModel.pageSize ?? INITIAL_PAGE_SIZE;
  }

  // Sorting
  if (sortModel && sortModel.length > 0) {
    const sort = sortModel[0];
    const direction = sort.sort === 'desc' ? '-' : '';
    params.ordering = `${direction}${sort.field}`;
  }

  // Filtering & Search: extract search term from filter model
  if (filterModel?.items?.length > 0) {
    filterModel.items.forEach((filter) => {
      if (filter.value) {
        // If field is 'name' with 'contains' operator, send as search term
        if (filter.field === 'name' && filter.operator === 'contains') {
          params.search = filter.value;
        } else {
          // Other filters as direct field params
          params[filter.field] = filter.value;
        }
      }
    });
  }

  return params;
};

/**
 * Production-grade hook for DataGrid with server-side pagination, sorting, and filtering
 * Internally manages React Query for proper caching and request management
 *
 * @param {Object} config - Configuration object
 * @param {String} config.url - API endpoint URL
 * @param {Number} config.defaultPageSize - Default page size (default: 10)
 * @param {Function} config.transformData - Optional function to transform API response
 * @param {Number} config.staleTime - Milliseconds before data is considered stale (default: 5min)
 * @param {Function} config.onError - Optional error callback
 *
 * @returns {Object} Table state and handlers
 */
export function useCrudTable(config) {
  const {
    url,
    defaultPageSize = INITIAL_PAGE_SIZE,
    transformData,
    staleTime = DEFAULT_STALE_TIME,
    onError,
  } = config;

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: defaultPageSize,
  });

  const [filterModel, setFilterModel] = useState({ items: [] });
  const [sortModel, setSortModel] = useState([]);

  // Build query parameters from current models
  const queryParams = useMemo(
    () => buildQueryParams({ paginationModel, sortModel, filterModel }),
    [paginationModel, sortModel, filterModel]
  );

  // React Query for server-side data fetching
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: createQueryKey(url, paginationModel, sortModel, filterModel),
    queryFn: async ({ signal }) => {
      const response = await authorizedRequest({
        url,
        signal,
        ...queryParams,
      });

      // Transform data if transformer provided
      if (transformData) {
        return transformData(response);
      }

      // Default transformation for paginated API responses
      const items = response.results || response.items || (Array.isArray(response) ? response : []);
      const itemCount = response.count || response.total || response.totalItems || items.length || 0;

      // Debug: log response structure for troubleshooting
      if (!response.results && !response.items && !response.count && !response.total && !response.totalItems) {
        console.debug(`[useCrudTable] ${url} - Response structure:`, { hasResults: !!response.results, hasItems: !!response.items, count: response.count, total: response.total, totalItems: response.totalItems, isArray: Array.isArray(response), length: response.length });
      }

      return {
        items,
        itemCount,
      };
    },
    staleTime,
    gcTime: DEFAULT_CACHE_TIME,
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!url,
  });

  // Handle errors
  if (error && onError) {
    onError(error);
  }

  const handlePaginationModelChange = useCallback((model) => {
    setPaginationModel(model);
  }, []);

  const handleFilterModelChange = useCallback((model) => {
    setFilterModel(model);
  }, []);

  const handleSortModelChange = useCallback((model) => {
    setSortModel(model);
  }, []);

  return {
    rows: data?.items || [],
    rowCount: data?.itemCount || 0,
    isLoading: isLoading || isFetching,
    error,
    paginationModel,
    sortModel,
    filterModel,
    onPaginationModelChange: handlePaginationModelChange,
    onSortModelChange: handleSortModelChange,
    onFilterModelChange: handleFilterModelChange,
    refetch,
  };
}

useCrudTable.propTypes = {
  url: PropTypes.string.isRequired,
  defaultPageSize: PropTypes.number,
  transformData: PropTypes.func,
  staleTime: PropTypes.number,
  onError: PropTypes.func,
};
