import { Autocomplete, TextField } from '@mui/material';

/**
 * Generic autocomplete field for forms. Supports custom data structures via configuration.
 *
 * Props:
 *   - options: Array of option objects
 *   - field: React Hook Form field object
 *   - labelFormatter: (option) => string - Custom function to format display label
 *   - valueExtractor: (option) => any - Custom function to extract value
 *   - idField: string - Field name for unique identifier (default: 'id')
 *
 * Examples:
 *   // Members with { label: "...", value: { id, email, name } }
 *   <CustomInputAutocomplete options={memberOptions} field={field} />
 *
 *   // Departments with { id, name } - no wrapper
 *   <CustomInputAutocomplete
 *     options={depts}
 *     field={field}
 *     labelFormatter={(opt) => opt.name}
 *     valueExtractor={(opt) => ({ id: opt.id, name: opt.name })}
 *   />
 */
const CustomInputAutocomplete = ({
  options = [],
  field,
  placeholder,
  label,
  multiple = false,
  onFieldChange,
  labelFormatter,
  valueExtractor,
  idField = 'id',
  ...rest
}) => {
  const { meta } = field.state;
  const showError = meta.isTouched && meta.errors && meta.errors.length > 0;

  const defaultLabelFormatter = (option) => {
    if (!option) return '';
    // Handle string values directly (e.g., status: "active")
    if (typeof option === 'string') return option;
    // Handle object with label property
    if (option.label && typeof option.label === 'string') return option.label;
    // Handle object with name/email properties
    const name = option.name?.toString?.() || '';
    const email = option.email?.toString?.() || '';
    if (name || email) {
      return name && email ? `${name} (${email})` : (name || email);
    }
    return '';
  };

  const defaultValueExtractor = (option) => option.value || option;

  const getLabel = labelFormatter || defaultLabelFormatter;
  const extractValue = valueExtractor || defaultValueExtractor;

  const getOptionLabel = (option) => {
    if (!option) return '';
    const label = getLabel(option);
    return typeof label === 'string' ? label : '';
  };

  const isOptionEqualToValue = (option, value) => {
    if (!value) return false;
    // Handle string values (e.g., status: "active")
    if (typeof value === 'string' && typeof option.value === 'string') {
      return option.value === value;
    }
    // Handle object values with ID comparison
    const optionId = option[idField] ?? option.value?.[idField];
    const valueId = value[idField];
    return optionId && valueId && optionId === valueId;
  };

  const handleAutocompleteChange = (e, selectedValue) => {
    if (!selectedValue) {
      field.handleChange(multiple ? [] : null);
      onFieldChange?.(multiple ? [] : null);
      return;
    }

    const actualValue = multiple
      ? selectedValue.map(opt => extractValue(opt))
      : extractValue(selectedValue);

    field.handleChange(actualValue);
    onFieldChange?.(actualValue);
  };

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      value={field.state.value || (multiple ? [] : null)}
      onChange={handleAutocompleteChange}
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
