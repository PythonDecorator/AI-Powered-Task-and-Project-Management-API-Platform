import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

export default function ErrorMessage({ message = 'An error occurred', severity = 'error' }) {
  return (
    <Box sx={{ py: 2 }}>
      <Alert severity={severity}>{message}</Alert>
    </Box>
  );
}
