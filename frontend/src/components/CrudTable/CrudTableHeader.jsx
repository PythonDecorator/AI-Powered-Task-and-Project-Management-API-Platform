import * as React from 'react';
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PropTypes from 'prop-types';

function CrudTableHeader({ onRefresh, isLoading, onCreate, createLabel = 'Create', tableName, rowCount, onSearch }) {
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState('');

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(searchInput);
    }
  };

  const handleSearchClick = () => {
    onSearch?.(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearch?.('');
  };

  const handleRefresh = () => {
    setSearchInput('');
    setShowSearch(false);
    onRefresh?.();
  };

  return (
    <GridToolbarContainer sx={{ flexDirection: 'column', alignItems: 'stretch', pb: 0, gap: 0.75 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, px: 1, py: 0.75 }}>
        {tableName && (
          <Chip
            label={`${tableName} • ${rowCount ?? 0} item${(rowCount ?? 0) !== 1 ? 's' : ''}`}
            variant="filled"
            size="small"
            sx={{
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.9rem',
              height: 'auto',
              '& .MuiChip-label': { px: 1, py: 0.5 }
            }}
          />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5}}>
          <Tooltip title="Refresh (clears search)" enterDelay={700}>
            <span>
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={isLoading}
                aria-label="refresh"
                sx={{
                  color: 'action.active',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {onCreate && (
            <Button
              size="small"
              variant="contained"
              onClick={onCreate}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
            >
              + {createLabel}
            </Button>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport />
        <Tooltip title={showSearch ? 'Close search' : 'Open search'} enterDelay={700}>
          <IconButton
            size="small"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="search"
            sx={{
              color: showSearch ? 'primary.main' : 'action.active',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {showSearch && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, pb: 0.5 }}>
          <TextField
            size="small"
            placeholder="Type to search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            variant="outlined"
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                fontSize: '0.875rem',
              },
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 0.5, color: 'action.active' }} fontSize="small" />,
              endAdornment: searchInput && (
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ p: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
          <Button
            size="small"
            variant="outlined"
            onClick={handleSearchClick}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            Search
          </Button>
        </Box>
      )}
    </GridToolbarContainer>
  );
}

CrudTableHeader.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onCreate: PropTypes.func,
  createLabel: PropTypes.string,
  tableName: PropTypes.string,
  rowCount: PropTypes.number,
  onSearch: PropTypes.func,
};

export default CrudTableHeader;
