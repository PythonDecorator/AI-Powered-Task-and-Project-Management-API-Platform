import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

export default function DeleteConfirmDialog({
  open,
  title = 'Delete Item',
  itemName = '',
  warnings = [],
  onConfirm,
  onCancel,
  isLoading = false,
  requireTypeConfirm = false,
  showReason = false,
}) {
  const [typeConfirmation, setTypeConfirmation] = useState('');
  const [reason, setReason] = useState('');

  const canConfirm = requireTypeConfirm ? typeConfirmation === itemName : true;

  const handleConfirm = () => {
    onConfirm({ reason });
    setTypeConfirmation('');
    setReason('');
  };

  const handleCancel = () => {
    onCancel();
    setTypeConfirmation('');
    setReason('');
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {itemName && (
            <DialogContentText>
              You are about to delete: <strong>{itemName}</strong>
            </DialogContentText>
          )}

          {warnings.length > 0 && (
            <Alert severity="warning">
              <strong>Warning:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                {warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </Alert>
          )}

          {requireTypeConfirm && (
            <Box>
              <DialogContentText>
                Please type <strong>{itemName}</strong> to confirm deletion:
              </DialogContentText>
              <TextField
                fullWidth
                size="small"
                placeholder={itemName}
                value={typeConfirmation}
                onChange={(e) => setTypeConfirmation(e.target.value)}
                sx={{ mt: 1 }}
              />
            </Box>
          )}

          {showReason && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for deletion (optional)"
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={!canConfirm || isLoading}
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
