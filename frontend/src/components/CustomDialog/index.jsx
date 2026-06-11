import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { createNeonGlow, createGradient } from '../../assets/theme/utilities';
import CustomButton from '../CustomButton';

const CustomDialog = ({
  open = false,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default',
  loading = false,
  neon = false,
  neonColor = '#00d4ff',
  sx,
  ...props
}) => {
  const typeStyles = {
    default: {
      titleColor: 'text.primary',
      iconColor: '#667eea',
    },
    success: {
      titleColor: 'text.primary',
      iconColor: '#4caf50',
    },
    warning: {
      titleColor: 'text.primary',
      iconColor: '#ff9800',
    },
    error: {
      titleColor: 'text.primary',
      iconColor: '#f44336',
    },
  };

  const style = typeStyles[type] || typeStyles.default;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
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
      <DialogTitle
        sx={{
          color: style.titleColor,
          fontWeight: 600,
          fontSize: '20px',
          paddingBottom: 1,
        }}
      >
        {title}
      </DialogTitle>

      {(message || description) && (
        <DialogContent>
          {message && (
            <Typography variant="body1" sx={{ color: 'text.primary', mb: description ? 1 : 0 }}>
              {message}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {description}
            </Typography>
          )}
        </DialogContent>
      )}

      <DialogActions sx={{ padding: '16px', gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            color: 'text.primary',
            borderColor: 'rgba(102, 126, 234, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.08)',
            },
          }}
        >
          {cancelText}
        </Button>
        <CustomButton
          variant="contained"
          gradient
          gradientStart={style.iconColor}
          gradientEnd={style.iconColor === '#667eea' ? '#764ba2' : style.iconColor}
          onClick={onConfirm}
          isLoading={loading}
          disabled={loading}
        >
          {confirmText}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;
