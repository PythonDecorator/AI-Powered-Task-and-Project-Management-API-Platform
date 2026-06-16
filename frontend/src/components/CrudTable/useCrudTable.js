import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';

const INITIAL_PAGE_SIZE = 10;

/**
 * Reusable hook for DataGrid tables with server-side pagination, sorting, and filtering
 * Automatically persists state to URL search params
 *
 * @param {Object} config - Configuration object
 * @param {Function} config.fetchFn - Async function to fetch data: fetchFn({ paginationModel, sortModel, filterModel })
 * @param {Number} config.defaultPageSize - Default page size (default: 10)
 * @param {Function} config.onError - Optional error callback
 *
 * @returns {Object} Table state and handlers
 */
export function useCrudTable(config) {
  const { fetchFn, defaultPageSize = INITIAL_PAGE_SIZE, onError } = config;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize pagination from URL or defaults
  const [paginationModel, setPaginationModel] = useState({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    pageSize: searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : defaultPageSize,
  });

  // Initialize filter from URL or defaults
  const [filterModel, setFilterModel] = useState(
    searchParams.get('filter')
      ? JSON.parse(searchParams.get('filter') ?? '')
      : { items: [] }
  );

  // Initialize sort from URL or defaults
  const [sortModel, setSortModel] = useState(
    searchParams.get('sort') ? JSON.parse(searchParams.get('sort') ?? '') : []
  );

  // Data state
  const [rowsState, setRowsState] = useState({
    rows: [],
    rowCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update URL when pagination changes
  const handlePaginationModelChange = useCallback(
    (model) => {
      setPaginationModel(model);

      const params = new URLSearchParams(searchParams);
      params.set('page', String(model.page));
      params.set('pageSize', String(model.pageSize));

      const newSearchParamsString = params.toString();
      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`
      );
    },
    [navigate, pathname, searchParams]
  );

  // Update URL when filter changes
  const handleFilterModelChange = useCallback(
    (model) => {
      setFilterModel(model);

      const params = new URLSearchParams(searchParams);

      if (
        model.items.length > 0 ||
        (model.quickFilterValues && model.quickFilterValues.length > 0)
      ) {
        params.set('filter', JSON.stringify(model));
      } else {
        params.delete('filter');
      }

      const newSearchParamsString = params.toString();
      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`
      );
    },
    [navigate, pathname, searchParams]
  );

  // Update URL when sort changes
  const handleSortModelChange = useCallback(
    (model) => {
      setSortModel(model);

      const params = new URLSearchParams(searchParams);

      if (model.length > 0) {
        params.set('sort', JSON.stringify(model));
      } else {
        params.delete('sort');
      }

      const newSearchParamsString = params.toString();
      navigate(
        `${pathname}${newSearchParamsString ? '?' : ''}${newSearchParamsString}`
      );
    },
    [navigate, pathname, searchParams]
  );

  // Core data loading function
  const loadData = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await fetchFn({
        paginationModel,
        sortModel,
        filterModel,
      });

      setRowsState({
        rows: data.items || [],
        rowCount: data.itemCount || 0,
      });
    } catch (err) {
      setError(err);
      onError?.(err);
    }

    setIsLoading(false);
  }, [paginationModel, sortModel, filterModel, fetchFn, onError]);

  // Fetch data when models change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh handler (manual reload)
  const handleRefresh = useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  // Render helper: Create button
  const renderCreateButton = useCallback(
    (onClick, label = '+ New') => (
      <Button variant="contained" startIcon={<AddIcon />} onClick={onClick}>
        {label}
      </Button>
    ),
    []
  );

  // Render helper: Refresh button
  const renderRefreshButton = useCallback(() => (
    <Tooltip title="Reload data" placement="right" enterDelay={1000}>
      <div>
        <IconButton
          size="small"
          aria-label="refresh"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshIcon />
        </IconButton>
      </div>
    </Tooltip>
  ), [handleRefresh, isLoading]);

  // Return all state and handlers
  return {
    // State
    rows: rowsState.rows,
    rowCount: rowsState.rowCount,
    isLoading,
    error,
    paginationModel,
    sortModel,
    filterModel,

    // Handlers
    onPaginationModelChange: handlePaginationModelChange,
    onSortModelChange: handleSortModelChange,
    onFilterModelChange: handleFilterModelChange,
    refetch: loadData,

    // Render helpers
    renderCreateButton,
    renderRefreshButton,
  };
}
