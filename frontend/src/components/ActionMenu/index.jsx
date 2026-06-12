import { useState } from 'react';
import { Menu, MenuItem, IconButton, Divider } from '@mui/material';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import CustomTypography from '../CustomTypography/index.jsx';

const ActionMenu = ({ menuItems = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleMenuItemClick = (action) => {
    if (action) action();
    handleClose();
  };

  // Separate error items from regular items
  const regularItems = menuItems.filter(item => item.color !== 'error');
  const errorItems = menuItems.filter(item => item.color === 'error');

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          color: 'primary.main',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
          },
        }}
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          onClick: (e) => e.stopPropagation(),
        }}
        PaperProps={{
          sx: {
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '160px',
            border: '1px solid rgba(102, 126, 234, 0.15)',
          },
        }}
      >
        {regularItems.map(({ label, action }, index) => (
          <MenuItem
            key={index}
            onClick={() => handleMenuItemClick(action)}
            sx={{
              py: 1,
              px: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              },
            }}
          >
            <CustomTypography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontWeight: 500,
              }}
            >
              {label}
            </CustomTypography>
          </MenuItem>
        ))}

        {regularItems.length > 0 && errorItems.length > 0 && (
          <Divider sx={{ my: 0.5, borderColor: 'rgba(102, 126, 234, 0.1)' }} />
        )}

        {errorItems.map(({ label, action }, index) => (
          <MenuItem
            key={`error-${index}`}
            onClick={() => handleMenuItemClick(action)}
            sx={{
              py: 1,
              px: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
              },
            }}
          >
            <CustomTypography
              variant="body2"
              sx={{
                color: 'error.main',
                fontWeight: 600,
              }}
            >
              {label}
            </CustomTypography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ActionMenu;
