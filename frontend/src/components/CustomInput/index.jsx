import { TextField, Box, Typography } from '@mui/material';

const CustomInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error = false,
  errorMessage,
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'medium',
  variant = 'outlined',
  multiline = false,
  rows = 1,
  startAdornment,
  endAdornment,
  sx,
  ...props
}) => {
  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
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
          {required && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
        </Typography>
      )}
      <TextField
        fullWidth={fullWidth}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        disabled={disabled}
        size={size}
        variant={variant}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        InputProps={{
          startAdornment,
          endAdornment,
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
          },
          '& .MuiOutlinedInput-input': {
            color: 'text.primary',
            '&::placeholder': {
              color: 'text.secondary',
              opacity: 0.6,
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: error ? '#f44336' : 'rgba(102, 126, 234, 0.2)',
          },
          ...sx,
        }}
        {...props}
      />
      {error && errorMessage && (
        <Typography variant="caption" sx={{ color: '#f44336', mt: 0.5, display: 'block' }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default CustomInput;
