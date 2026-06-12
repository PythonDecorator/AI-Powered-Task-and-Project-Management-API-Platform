import { Box, Typography, Alert, Button } from '@mui/material';
import { RefreshOutlined } from '@mui/icons-material';

const ErrorMessage = ({ message = 'An error occurred', onRetry }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        gap: 2,
        px: 2,
      }}
    >
      <Alert severity="error" sx={{ maxWidth: '500px', width: '100%' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Something went wrong
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {message}
        </Typography>
      </Alert>
      {onRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorMessage;
