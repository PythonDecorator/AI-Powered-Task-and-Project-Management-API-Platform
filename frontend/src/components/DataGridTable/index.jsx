import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import CustomBox from '../CustomBox/index.jsx';
import CustomCard from '../CustomCard/index.jsx';
import TableHeader from './TableHeader.jsx';

const DataGridTable = ({
  title,
  columns,
  data = [],
  search = true,
  menu = true,
  more,
  header,
  replaceTitle = false,
  onSearch,
  isLoading = false,
  ...rest
}) => {
  const rowCount = data?.length || 0;

  return (
    <CustomCard>
      <TableHeader
        title={title}
        search={search}
        menu={menu}
        more={more}
        children={header}
        replaceTitle={replaceTitle}
        onSearch={onSearch}
        rowCount={rowCount}
      />
      <Box sx={{ width: '100%' }}>
        <DataGrid
          {...rest}
          disableColumnFilter
          disableColumnSelector
          disableRowSelectionOnClick
          rows={data}
          columns={columns.map((col) => ({
            ...col,
            headerAlign: 'center',
            align: 'center',
          }))}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          pagination
          loading={isLoading}
          sx={{
            border: 'none',
            backgroundColor: 'transparent',
            '& .MuiDataGrid-cell': {
              borderRight: '1px solid #e0e7ff',
              borderBottom: '1px solid #e0e7ff',
              padding: '14px 16px',
              fontSize: '0.9rem',
            },
            '& .MuiDataGrid-cell:last-child': {
              borderRight: 'none',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#f3f4f6',
              borderRight: '1px solid #d1d5db',
              borderBottom: '2px solid #d1d5db',
              fontWeight: 700,
              padding: '14px 16px',
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-columnHeader:last-child': {
              borderRight: 'none',
            },
            '& .MuiDataGrid-row': {
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: '#f9fafb',
              },
            },
            '& .MuiTablePagination-root': {
              borderTop: '1px solid #e5e7eb',
              backgroundColor: 'transparent',
            },
          }}
        />
      </Box>
      {!isLoading && rowCount === 0 && (
        <Box sx={{ py: 4, px: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            No records found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {search ? 'Try adjusting your search criteria' : 'Create your first record to get started'}
          </Typography>
        </Box>
      )}
    </CustomCard>
  );
};

export default DataGridTable;
