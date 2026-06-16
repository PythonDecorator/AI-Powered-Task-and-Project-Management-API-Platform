import * as React from 'react';
import { DataGrid, GridActionsCellItem, gridClasses } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';

/**
 * Ultra-reusable DataGrid component
 * Automatically handles pagination, sorting, filtering, and actions
 *
 * @param {Object} props
 * @param {Object} props.table - Table state from useDataTable hook
 * @param {Array} props.columns - Column definitions (without actions)
 * @param {Function} props.onEdit - Callback when edit button clicked: onEdit(row)
 * @param {Function} props.onDelete - Callback when delete button clicked: onDelete(row)
 * @param {Function} props.getRowId - Function to get row ID (default: row.id)
 * @param {Object} props.sx - Additional sx styling
 */
export default function GenericTable({
  table,
  columns,
  onEdit,
  onDelete,
  getRowId = (row) => row.id,
  sx = {},
}) {
  // Automatically add Edit/Delete action column
  const columnsWithActions = React.useMemo(() => {
    const actionColumn = {
      field: 'actions',
      type: 'actions',
      flex: 0.8,
      align: 'right',
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="edit-action"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => onEdit?.(row)}
        />,
        <GridActionsCellItem
          key="delete-action"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => onDelete?.(row)}
        />,
      ],
    };

    return [...columns, actionColumn];
  }, [columns, onEdit, onDelete]);

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
          columns={columnsWithActions}
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
          showToolbar
          pageSizeOptions={pageSizeOptions}
          getRowId={getRowId}
          slotProps={{
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

GenericTable.propTypes = {
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
  }).isRequired,
  columns: PropTypes.array.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  getRowId: PropTypes.func,
  sx: PropTypes.object,
};
