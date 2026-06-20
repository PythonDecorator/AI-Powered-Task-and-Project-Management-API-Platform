import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';

const CustomInputAutocomplete = ({
  options = [],
  field,
  multiple = false,
  error = false,
  label,
  placeholder,
  required = false,
  ...props
}) => {
  const { state, handleChange } = field;
  const value = state.value;

  const handleChange_ = (event) => {
    const selectedValue = event.target.value;
    handleChange(selectedValue);
  };

  const handleDelete = (deletedItem) => (event) => {
    event.stopPropagation();
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter((item) => {
        if (typeof item === 'string' && typeof deletedItem === 'string') {
          return item !== deletedItem;
        }
        return (item.value?.id !== deletedItem.value?.id) &&
               (item?.id !== deletedItem?.id) &&
               (item.label !== deletedItem.label);
      });
      handleChange(newValue);
    }
  };

  const getOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    if (!option) return '';
    return option.label || '';
  };

  const isOptionSelected = (option) => {
    if (!value) return false;
    if (multiple && Array.isArray(value)) {
      return value.some((item) => {
        if (typeof option === 'string' && typeof item === 'string') {
          return option === item;
        }
        return (option.value?.id && item?.id && option.value.id === item.id) ||
               (option.value?.id && item?.value?.id && option.value.id === item.value.id) ||
               (option.label === item?.label);
      });
    }
    return false;
  };

  const renderValue = (selected) => {
    if (!selected || (Array.isArray(selected) && selected.length === 0)) {
      return (
        <span style={{ opacity: 0.6, color: 'inherit' }}>
          {placeholder || 'Select...'}
        </span>
      );
    }

    if (multiple && Array.isArray(selected)) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            py: 0.25,
          }}
        >
          {selected.map((item, index) => (
            <Chip
              key={typeof item === 'string' ? item : item.value?.id || index}
              label={getOptionLabel(item)}
              onDelete={handleDelete(item)}
              size="small"
              variant="filled"
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 500,
                fontSize: '0.85rem',
                height: 24,
                '& .MuiChip-deleteIcon': {
                  color: 'primary.contrastText',
                  opacity: 0.7,
                  fontSize: '0.9rem',
                  '&:hover': {
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Box>
      );
    }

    return getOptionLabel(selected);
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
      <FormControl
        fullWidth
        error={!!error}
        size="small"
        variant="outlined"
      >
        <Select
          multiple={multiple}
          value={value || (multiple ? [] : '')}
          onChange={handleChange_}
          renderValue={renderValue}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 1,
            fontSize: '0.95rem',
            '& .MuiSelect-multiple .MuiSelect-select': {
              py: 1,
              px: 1,
              minHeight: multiple && value && Array.isArray(value) && value.length > 0 ? 'auto' : 'auto',
            },
            '&:hover': {
              backgroundColor: 'background.paper',
            },
            '&.Mui-focused': {
              backgroundColor: 'background.paper',
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: 'background.paper',
                '& .MuiMenuItem-root': {
                  py: 1,
                  px: 1.5,
                  fontSize: '0.9rem',
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-selected': {
                    backgroundColor: multiple ? 'transparent' : 'action.selected',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: multiple ? 'action.hover' : 'action.selected',
                    },
                  },
                },
              },
            },
          }}
          {...props}
        >
          {options.map((option, index) => (
            <MenuItem
              key={typeof option === 'string' ? option : option.value?.id || index}
              value={option}
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {multiple && (
                <Checkbox
                  checked={isOptionSelected(option)}
                  size="small"
                  sx={{ mr: 1.5 }}
                />
              )}
              <ListItemText
                primary={getOptionLabel(option)}
                sx={{
                  m: 0,
                  '& .MuiTypography-root': {
                    fontSize: '0.9rem',
                  },
                }}
              />
            </MenuItem>
          ))}
        </Select>
        {error && (
          <FormHelperText sx={{ mt: 0.5 }}>
            {typeof error === 'string' ? error : error.message || 'Invalid selection'}
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  );
};

CustomInputAutocomplete.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
    })
  ),
  field: PropTypes.object.isRequired,
  multiple: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.object]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};

export default CustomInputAutocomplete;
