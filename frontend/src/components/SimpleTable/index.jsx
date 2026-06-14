import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import CustomCard from '../CustomCard/index.jsx';
import CustomBox from '../CustomBox/index.jsx';
import TableHeader from './TableHeader.jsx';

const SimpleTable = ({
  title,
  columns = [],
  rows = [],
  search = true,
  more,
  onSearch,
  isLoading = false,
  header,
  replaceTitle = false,
  ...rest
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const rowCount = rows?.length || 0;

  return (
    <CustomCard>
      <TableHeader
        title={title}
        search={search}
        more={more}
        children={header}
        replaceTitle={replaceTitle}
        onSearch={onSearch}
        rowCount={rowCount}
      />

      {isLoading ? (
        <CustomBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </CustomBox>
      ) : rowCount === 0 ? (
        <CustomBox sx={{ py: 6, px: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            No records found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {search ? 'Try adjusting your search criteria' : 'Create your first record to get started'}
          </Typography>
        </CustomBox>
      ) : (
        <>
          <TableContainer sx={{
            overflow: 'auto',
            overflowY: 'hidden',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(102, 126, 234, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.5)',
              },
            },
          }}>
            <Table
              sx={{
                backgroundColor: 'transparent',
                borderCollapse: 'collapse',
                minWidth: '600px',
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                    '& .MuiTableCell-head': {
                      borderBottom: '2px solid rgba(102, 126, 234, 0.25)',
                      borderRight: '1px solid rgba(102, 126, 234, 0.18)',
                      backgroundColor: 'transparent',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      padding: '14px 16px',
                      color: 'text.primary',
                      textAlign: 'center',
                      '&:last-child': {
                        borderRight: 'none',
                      },
                    },
                  }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.field} align="center">
                      {col.headerName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedRows.map((row, idx) => (
                  <TableRow
                    key={row.id || idx}
                    sx={{
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      },
                      '& .MuiTableCell-body': {
                        borderBottom: '1px solid rgba(102, 126, 234, 0.12)',
                        borderRight: '1px solid rgba(102, 126, 234, 0.12)',
                        padding: '14px 16px',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        color: 'text.primary',
                        backgroundColor: 'transparent',
                        '&:last-child': {
                          borderRight: 'none',
                        },
                      },
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell key={`${row.id}-${col.field}`} align="center">
                        {col.renderCell ? col.renderCell({ row, field: col.field }) : row[col.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={rowCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              backgroundColor: 'transparent',
              borderTop: '1px solid rgba(102, 126, 234, 0.12)',
              '& .MuiTablePagination-toolbar': {
                padding: '12px 16px',
              },
            }}
          />
        </>
      )}
    </CustomCard>
  );
};

export default SimpleTable;
