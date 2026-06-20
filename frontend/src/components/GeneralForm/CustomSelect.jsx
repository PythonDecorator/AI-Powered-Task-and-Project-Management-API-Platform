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

const CustomSelect = ({
  options = [],
  field,
  error = false,
  label,
  placeholder,
  required = false,
}) => {
  const { state, handleChange } = field;
  const value = state.value;

  const handleChange_ = (event) => {
    handleChange(event.target.value);
  };

  const handleDelete = (deletedItem) => (event) => {
    event.stopPropagation();
    if (Array.isArray(value)) {
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
    return option?.label || '';
  };

  const isOptionSelected = (option) => {
    if (!value || !Array.isArray(value)) return false;
    return value.some((item) => {
      if (typeof option === 'string' && typeof item === 'string') {
        return option === item;
      }
      return (option.value?.id && item?.id && option.value.id === item.id) ||
             (option.value?.id && item?.value?.id && option.value.id === item.value.id) ||
             (option.label === item?.label);
    });
  };

  const renderValue = (selected) => {
    if (!selected || (Array.isArray(selected) && selected.length === 0)) {
      return <span style={{ opacity: 0.6 }}>{placeholder || 'Select...'}</span>;
    }

    if (Array.isArray(selected)) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, width: '100%' }}>
          {selected.map((item, index) => (
            <Chip
              key={typeof item === 'string' ? item : item.value?.id || index}
              label={getOptionLabel(item)}
              onDelete={handleDelete(item)}
              size="small"
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
        <FormLabel required={required} sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
          {label}
        </FormLabel>
      )}
      <FormControl
        fullWidth
        error={!!error}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: 'auto',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'flex-start',
            overflow: 'visible',
            pt: 0.75,
            pb: 0.75,
            pr: 1,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            overflow: 'visible',
          }
        }}
      >
        <Select
          multiple
          value={value || []}
          onChange={handleChange_}
          renderValue={renderValue}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            width: '100%',
            overflow: 'visible',
          }}
        >
          {options.map((option, index) => (
            <MenuItem key={typeof option === 'string' ? option : option.value?.id || index} value={option}>
              <Checkbox checked={isOptionSelected(option)} size="small" />
              <ListItemText primary={getOptionLabel(option)} />
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{typeof error === 'string' ? error : error.message}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

CustomSelect.propTypes = {
  options: PropTypes.array.isRequired,
  field: PropTypes.object.isRequired,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.object]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};

export default CustomSelect;
