import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  TextField,
  Box,
  Alert,
  AlertTitle,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const DeleteConfirmDialog = ({
  open = false,
  title = 'Delete Item',
  itemName = 'this item',
  onConfirm,
  onCancel,
  isLoading = false,
  warnings = [],
  requireTypeConfirm = true,
  showReason = true,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmText('');
      setReason('');
      setIsReady(false);
    }
  }, [open]);

  useEffect(() => {
    const textMatches = !requireTypeConfirm || confirmText.toLowerCase() === itemName.toLowerCase();
    const hasReason = !showReason || reason.trim().length > 0;
    setIsReady(textMatches && hasReason);
  }, [confirmText, reason, itemName, requireTypeConfirm, showReason]);

  const handleConfirm = () => {
    onConfirm({
      reason: showReason ? reason : undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: '4px solid #f44336',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon sx={{ color: '#f44336' }} />
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {/* Warnings Section */}
        {warnings && warnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Dependencies Found</AlertTitle>
            <Box component="ul" sx={{ pl: 1, mb: 0 }}>
              {warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </Box>
          </Alert>
        )}

        {/* Main Message */}
        <Typography sx={{ mb: 3, color: 'text.primary' }}>
          Are you sure you want to deactivate <strong>{itemName}</strong>? This member will no longer have access to the system.
        </Typography>

        {/* Reason Field */}
        {showReason && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for deactivation"
            placeholder="e.g., Left company, Role change, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mb: 2 }}
            disabled={isLoading}
          />
        )}

        {/* Type to Confirm */}
        {requireTypeConfirm && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Type <strong>{itemName}</strong> to confirm:
            </Typography>
            <TextField
              fullWidth
              placeholder={`Type "${itemName}" to confirm`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isLoading}
              error={confirmText.length > 0 && confirmText.toLowerCase() !== itemName.toLowerCase()}
              helperText={
                confirmText.length > 0 && confirmText.toLowerCase() !== itemName.toLowerCase()
                  ? 'Text does not match'
                  : ''
              }
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={isLoading || !isReady}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Deactivating...
            </>
          ) : (
            'Deactivate'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
