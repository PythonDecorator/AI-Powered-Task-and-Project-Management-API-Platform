import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createNeonGlow } from '../../assets/theme/utilities';

const CustomModal = ({
  open = false,
  onClose,
  title,
  children,
  actions,
  size = 'sm',
  neon = false,
  neonColor = '#00d4ff',
  sx,
  ...props
}) => {
  const sizeMap = {
    xs: '300px',
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          borderRadius: '12px',
          boxShadow: neon
            ? createNeonGlow(neonColor, 0.3)
            : '0 10px 40px rgba(0, 0, 0, 0.3)',
          ...sx,
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        },
      }}
      {...props}
    >
      {title && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 1,
          }}
        >
          <DialogTitle
            sx={{
              flex: 1,
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '18px',
            }}
          >
            {title}
          </DialogTitle>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      {children && (
        <DialogContent
          sx={{
            color: 'text.primary',
            paddingTop: title ? '12px' : '24px',
            paddingBottom: actions ? '12px' : '24px',
          }}
        >
          {children}
        </DialogContent>
      )}

      {actions && <DialogActions sx={{ padding: '16px' }}>{actions}</DialogActions>}
    </Dialog>
  );
};

export default CustomModal;
