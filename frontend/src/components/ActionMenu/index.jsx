import { useState } from 'react';
import { Menu, MenuItem, IconButton, Divider, useTheme, alpha } from '@mui/material';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import Typography from "@mui/material/Typography";

const ActionMenu = ({ menuItems = [] }) => {
  const theme = useTheme();
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

  // Separate items by color type
  const regularItems = menuItems.filter(item => !item.color || (item.color !== 'error' && item.color !== 'success'));
  const errorItems = menuItems.filter(item => item.color === 'error');
  const successItems = menuItems.filter(item => item.color === 'success');

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          color: 'primary.main',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
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
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
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
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontWeight: 500,
              }}
            >
              {label}
            </Typography>
          </MenuItem>
        ))}

        {successItems.map(({ label, action }, index) => (
          <MenuItem
            key={`success-${index}`}
            onClick={() => handleMenuItemClick(action)}
            sx={{
              py: 1,
              px: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.success.main, 0.1),
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'success.main',
                fontWeight: 600,
              }}
            >
              {label}
            </Typography>
          </MenuItem>
        ))}

        {(regularItems.length > 0 || successItems.length > 0) && errorItems.length > 0 && (
          <Divider sx={{ my: 0.5, borderColor: alpha(theme.palette.primary.main, 0.1) }} />
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
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'error.main',
                fontWeight: 600,
              }}
            >
              {label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ActionMenu;
