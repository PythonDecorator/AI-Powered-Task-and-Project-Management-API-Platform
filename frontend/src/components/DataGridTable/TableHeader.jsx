import { Box, TextField, InputAdornment, Chip } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import CustomTypography from '../CustomTypography/index.jsx';

const TableHeader = ({
  title,
  search = true,
  menu = true,
  more,
  children,
  onSearch,
  replaceTitle = false,
  rowCount = 0,
}) => {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid rgba(102, 126, 234, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        backgroundColor: 'transparent',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
        {!replaceTitle && title && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CustomTypography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </CustomTypography>
            {rowCount > 0 && (
              <Chip
                label={`${rowCount} items`}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: 'text.secondary',
                }}
              />
            )}
          </Box>
        )}
        {replaceTitle && children}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {search && (
          <TextField
            placeholder="Search..."
            size="small"
            onChange={(e) => onSearch?.(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                },
              },
              minWidth: '250px',
            }}
          />
        )}
        {more && more}
      </Box>
    </Box>
  );
};

export default TableHeader;
