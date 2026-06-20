import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';

const CustomSelectSingle = ({
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

  const getOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    return option?.label || '';
  };

  const renderValue = (selected) => {
    if (!selected) {
      return <span style={{ opacity: 0.6 }}>{placeholder || 'Select...'}</span>;
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
      <FormControl fullWidth error={!!error} size="small">
        <Select
          value={value || ''}
          onChange={handleChange_}
          renderValue={renderValue}
        >
          {options.map((option, index) => (
            <MenuItem key={typeof option === 'string' ? option : option.value?.id || index} value={option}>
              <ListItemText primary={getOptionLabel(option)} />
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{typeof error === 'string' ? error : error.message}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

CustomSelectSingle.propTypes = {
  options: PropTypes.array.isRequired,
  field: PropTypes.object.isRequired,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.object]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};

export default CustomSelectSingle;
