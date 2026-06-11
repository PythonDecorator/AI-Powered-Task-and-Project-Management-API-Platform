import { TextField, Box, Typography, InputAdornment } from '@mui/material';
import { forwardRef } from 'react';

const CustomFormInput = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error = false,
  helperText,
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'medium',
  variant = 'outlined',
  multiline = false,
  rows = 1,
  startIcon,
  endIcon,
  hideLabel = false,
  validation,
  sx,
  ...props
}, ref) => {
  const hasError = error || (validation && validation.hasError);
  const displayError = helperText || (validation && validation.error);

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && !hideLabel && (
        <Typography
          component="label"
          variant="subtitle2"
          sx={{
            display: 'block',
            mb: 1,
            fontWeight: 500,
            color: hasError ? '#f44336' : 'text.primary',
          }}
        >
          {label}
          {required && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
        </Typography>
      )}
      <TextField
        ref={ref}
        fullWidth={fullWidth}
        type={type}
        placeholder={placeholder}
        error={hasError}
        disabled={disabled}
        size={size}
        variant={variant}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        helperText={displayError}
        InputProps={{
          startAdornment: startIcon && (
            <InputAdornment position="start" sx={{ mr: 1 }}>
              {startIcon}
            </InputAdornment>
          ),
          endAdornment: endIcon && (
            <InputAdornment position="end" sx={{ ml: 1 }}>
              {endIcon}
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(102, 126, 234, 0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.08)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              boxShadow: `0 0 0 3px rgba(102, 126, 234, 0.15)`,
            },
            '&.Mui-error': {
              backgroundColor: 'rgba(244, 67, 54, 0.05)',
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px rgba(244, 67, 54, 0.15)`,
              },
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(102, 126, 234, 0.03)',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: 'text.primary',
            '&::placeholder': {
              color: 'text.secondary',
              opacity: 0.6,
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? '#f44336' : 'rgba(102, 126, 234, 0.2)',
          },
          '& .MuiFormHelperText-root': {
            color: hasError ? '#f44336' : 'text.secondary',
            marginTop: '6px',
          },
          ...sx,
        }}
        {...props}
      />
    </Box>
  );
});

CustomFormInput.displayName = 'CustomFormInput';

export default CustomFormInput;
