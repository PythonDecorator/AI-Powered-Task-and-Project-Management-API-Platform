import { Autocomplete, TextField } from '@mui/material';

const CustomInputAutocomplete = ({
  options = [],
  field,
  placeholder,
  label,
  multiple = false,
  ...rest
}) => {
  const { meta } = field.state;
  const showError = meta.isTouched && meta.errors && meta.errors.length > 0;

  const getOptionLabel = (option) => {
    if (!option) return '';
    return option.label || option;
  };

  const isOptionEqualToValue = (option, value) => {
    if (!value) return false;
    if (option.value?.id && value?.id) return option.value.id === value.id;
    return option.value === value;
  };

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      value={field.state.value || (multiple ? [] : null)}
      onChange={(e, value) => field.handleChange(value)}
      onBlur={field.handleBlur}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      filterSelectedOptions={multiple}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          error={showError}
          helperText={showError ? meta.errors.join(', ') : ''}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              },
            },
          }}
        />
      )}
      {...rest}
    />
  );
};

export default CustomInputAutocomplete;
