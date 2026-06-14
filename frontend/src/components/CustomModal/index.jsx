import { useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ModalContext } from '../../store/ModalContextProvider.jsx';

const CustomModal = ({ children, title, maxWidth = 'sm', action }) => {
  const { modalIsOpen, onCloseModal } = useContext(ModalContext);
  const shouldShow = action ? (modalIsOpen.open && modalIsOpen.action === action) : modalIsOpen.open;

  return (
    <Dialog
      open={shouldShow}
      onClose={onCloseModal}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          fontSize: '1.25rem',
          borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
          pb: 2,
        }}
      >
        <span>{title}</span>
        <IconButton
          onClick={onCloseModal}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
