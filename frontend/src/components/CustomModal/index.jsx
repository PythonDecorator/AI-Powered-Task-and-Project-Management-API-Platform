import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function CustomModal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  maxWidth = 'sm',
  fullWidth = true,
  showActions = true,
  disableBackdropClick = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      onBackdropClick={disableBackdropClick ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundImage: 'none',
        },
      }}
    >
      {title && (
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.3rem',
            pb: 2,
            color: 'text.primary',
          }}
        >
          {title}
        </DialogTitle>
      )}
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {children}
        </Box>
      </DialogContent>
      {showActions && (
        <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
          >
            {cancelLabel}
          </Button>
          {onSubmit && (
            <Button
              onClick={onSubmit}
              variant="contained"
              sx={{
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              {submitLabel}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}
