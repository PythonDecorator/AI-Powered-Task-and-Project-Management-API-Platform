import { TextField, Box, Typography, InputAdornment } from '@mui/material';
import { forwardRef } from 'react';

const LoginInput = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error = false,
  helperText,
  disabled = false,
  icon,
  sx,
  ...props
}, ref) => {
  return (
    <Box>
      {label && (
        <Typography
          component="label"
          variant="subtitle2"
          sx={{
            display: 'block',
            mb: 1,
            fontWeight: 500,
            color: error ? '#f44336' : 'text.primary',
          }}
        >
          {label}
        </Typography>
      )}
      <TextField
        ref={ref}
        fullWidth
        type={type}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        variant="outlined"
        size="medium"
        helperText={helperText}
        InputProps={{
          startAdornment: icon && (
            <InputAdornment position="start" sx={{ mr: 1.5, color: 'text.secondary' }}>
              {icon}
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(102, 126, 234, 0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.08)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              boxShadow: `0 0 0 3px rgba(102, 126, 234, 0.2), inset 0 0 20px rgba(102, 126, 234, 0.05)`,
            },
            '&.Mui-error': {
              backgroundColor: 'rgba(244, 67, 54, 0.05)',
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px rgba(244, 67, 54, 0.2)`,
              },
            },
          },
          '& .MuiOutlinedInput-input': {
            color: 'text.primary',
            fontSize: '14px',
            '&::placeholder': {
              color: 'text.secondary',
              opacity: 0.7,
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: error ? '#f44336' : 'rgba(102, 126, 234, 0.2)',
            borderWidth: '1px',
          },
          '& .MuiFormHelperText-root': {
            color: '#f44336',
            marginTop: '6px',
            fontSize: '12px',
          },
          ...sx,
        }}
        {...props}
      />
    </Box>
  );
});

LoginInput.displayName = 'LoginInput';

export default LoginInput;
