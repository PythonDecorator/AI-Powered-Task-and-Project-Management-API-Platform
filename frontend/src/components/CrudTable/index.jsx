import * as React from 'react';
import {
  DataGrid,
  gridClasses,
} from '@mui/x-data-grid';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import CrudTableHeader from './CrudTableHeader';

export default function CrudTable({
  table,
  columns,
  onCreate,
  createLabel = 'Create',
  tableName,
  getRowId = (row) => row.id,
  sx = {},
}) {

  // DataGrid initial state config
  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: table.paginationModel.pageSize } },
    }),
    [table.paginationModel.pageSize]
  );

  // Page size options
  const pageSizeOptions = React.useMemo(
    () => [5, 10, 25, 50],
    []
  );

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      {table.error ? (
        <Alert severity="error">{table.error?.message || 'Failed to load data'}</Alert>
      ) : (
        <DataGrid
          rows={table.rows}
          rowCount={table.rowCount}
          columns={columns}
          pagination
          sortingMode="server"
          filterMode="server"
          paginationMode="server"
          paginationModel={table.paginationModel}
          onPaginationModelChange={table.onPaginationModelChange}
          sortModel={table.sortModel}
          onSortModelChange={table.onSortModelChange}
          filterModel={table.filterModel}
          onFilterModelChange={table.onFilterModelChange}
          disableRowSelectionOnClick
          loading={table.isLoading}
          initialState={initialState}
          pageSizeOptions={pageSizeOptions}
          getRowId={getRowId}
          slots={{ toolbar: CrudTableHeader }}
          slotProps={{
            toolbar: {
              onRefresh: () => {
                table.onFilterModelChange({ items: [] });
                table.onPaginationModelChange({ page: 0, pageSize: table.paginationModel.pageSize });
                table.refetch();
              },
              isLoading: table.isLoading,
              onCreate,
              createLabel,
              tableName,
              rowCount: table.rowCount,
              onSearch: (searchTerm) => {
                if (searchTerm) {
                  table.onFilterModelChange({
                    items: [
                      {
                        field: 'name',
                        operator: 'contains',
                        value: searchTerm,
                      },
                    ],
                    linkOperator: 'and',
                  });
                } else {
                  table.onFilterModelChange({ items: [] });
                }
              },
            },
            loadingOverlay: {
              variant: 'circular-progress',
              noRowsVariant: 'circular-progress',
            },
            baseIconButton: {
              size: 'small',
            },
          }}
          sx={{
            [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
              outline: 'transparent',
            },
            [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
              {
                outline: 'none',
              },
            [`& .${gridClasses.row}:hover`]: {
              cursor: 'pointer',
            },
            ...sx,
          }}
        />
      )}
    </Box>
  );
}

CrudTable.propTypes = {
  table: PropTypes.shape({
    rows: PropTypes.array.isRequired,
    rowCount: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    error: PropTypes.any,
    paginationModel: PropTypes.object.isRequired,
    onPaginationModelChange: PropTypes.func.isRequired,
    sortModel: PropTypes.array.isRequired,
    onSortModelChange: PropTypes.func.isRequired,
    filterModel: PropTypes.object.isRequired,
    onFilterModelChange: PropTypes.func.isRequired,
    refetch: PropTypes.func.isRequired,
  }).isRequired,
  columns: PropTypes.array.isRequired,
  onCreate: PropTypes.func,
  createLabel: PropTypes.string,
  tableName: PropTypes.string,
  getRowId: PropTypes.func,
  sx: PropTypes.object,
};
