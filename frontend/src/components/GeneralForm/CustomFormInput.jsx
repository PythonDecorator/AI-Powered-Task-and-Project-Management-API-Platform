import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';

const CustomFormInput = ({
  type = 'text',
  value,
  onChange,
  onBlur,
  error = false,
  label,
  placeholder,
  required = false,
  disabled = false,
  ...props
}) => {
  const handleChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(e);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {label && (
        <FormLabel
          sx={{
            fontWeight: 600,
            fontSize: '0.95rem',
            color: 'text.primary',
            textTransform: 'none',
          }}
          required={required}
        >
          {label}
        </FormLabel>
      )}
      <OutlinedInput
        type={type}
        value={value || ''}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        size="small"
        disabled={disabled}
        error={!!error}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 1,
          fontSize: '0.95rem',
          '& .MuiOutlinedInput-input::placeholder': {
            opacity: 0.6,
            color: 'text.secondary',
          },
          '&:hover': {
            backgroundColor: 'background.paper',
          },
          '&.Mui-focused': {
            backgroundColor: 'background.paper',
          },
          '&.Mui-error': {
            borderColor: 'error.main',
          },
          '&.Mui-disabled': {
            backgroundColor: 'action.disabledBackground',
            color: 'action.disabled',
          },
        }}
        {...props}
      />
      {error && (
        <FormHelperText error sx={{ mt: 0 }}>
          {typeof error === 'string' ? error : error.message || 'Invalid value'}
        </FormHelperText>
      )}
    </Box>
  );
};

CustomFormInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.object]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CustomFormInput;
