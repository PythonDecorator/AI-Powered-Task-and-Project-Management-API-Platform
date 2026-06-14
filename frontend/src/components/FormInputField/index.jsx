import { Box, Checkbox, FormControlLabel } from '@mui/material';
import CustomBox from '../CustomBox/index.jsx';
import CustomTypography from '../CustomTypography/index.jsx';
import CustomFormInput from '../CustomFormInput/index.jsx';
import CustomInputAutocomplete from '../CustomInputAutocomplete/index.jsx';

const FormInputField = ({
  label,
  type = 'text',
  field,
  options = [],
  placeholder,
  required = false,
  helperText,
  onChangeListener,
  ...rest
}) => {
  const handleChange = (value) => {
    field.handleChange(value);
    onChangeListener?.();
  };
  const { meta, value } = field.state;
  const showError = meta.isTouched && meta.errors && meta.errors.length > 0;
  const isTouched = meta.isTouched;
  const hasValue = value !== null && value !== '' && value !== undefined && (!Array.isArray(value) || value.length > 0);

  return (
    <CustomBox mb={3}>
      {label && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <CustomTypography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: showError ? 'error.main' : 'text.primary',
              transition: 'color 0.2s ease',
            }}
          >
            {label}
          </CustomTypography>
          {required && (
            <CustomTypography sx={{ color: 'error.main', fontSize: '1rem' }}>
              *
            </CustomTypography>
          )}
          {isTouched && !showError && hasValue && (
            <Box sx={{ color: 'success.main', fontSize: '1rem' }}>✓</Box>
          )}
        </Box>
      )}

      {type === 'select' ? (
        <CustomInputAutocomplete
          options={options}
          field={field}
          onFieldChange={(value) => handleChange(value)}
          placeholder={placeholder}
          multiple={rest.multiple}
          {...rest}
        />
      ) : type === 'checkbox' ? (
        <FormControlLabel
          control={
            <Checkbox
              checked={field.state.value || false}
              onChange={(e) => handleChange(e.target.checked)}
              onBlur={field.handleBlur}
            />
          }
          label={label}
        />
      ) : (
        <CustomFormInput
          type={type}
          placeholder={placeholder}
          error={showError}
          value={field.state.value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={field.handleBlur}
          {...rest}
        />
      )}

      <Box sx={{ height: '20px', mt: 0.5, ml: 0.5 }}>
        {showError && (
          <CustomTypography
            variant="caption"
            sx={{
              color: 'error.main',
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 500,
              animation: 'slideDown 0.2s ease',
            }}
          >
            {meta.errors.join(', ')}
          </CustomTypography>
        )}
        {helperText && !showError && (
          <CustomTypography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              fontSize: '0.75rem',
            }}
          >
            {helperText}
          </CustomTypography>
        )}
      </Box>
    </CustomBox>
  );
};

export default FormInputField;
