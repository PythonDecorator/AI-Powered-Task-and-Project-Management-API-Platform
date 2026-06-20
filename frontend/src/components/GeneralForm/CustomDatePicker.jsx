import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PropTypes from 'prop-types';

const CustomDatePicker = ({
  value,
  onChange,
  onBlur,
  error = false,
  label,
  placeholder,
  required = false,
  disabled = false,
}) => {
  const handleChange = (newValue) => {
    if (newValue && newValue.isValid && newValue.isValid()) {
      const isoString = newValue.format('YYYY-MM-DD');
      onChange({ target: { value: isoString } });
    } else {
      onChange({ target: { value: '' } });
    }
  };

  const dayjsValue = value && value.trim() ? dayjs(value) : null;

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
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={dayjsValue}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              error: !!error,
              placeholder: placeholder,
              sx: {
                '& .MuiOutlinedInput-root': {
                  py: 0.5,
                  px: 1,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  fontSize: '0.95rem',
                },
                '& .MuiOutlinedInput-input::placeholder': {
                  opacity: 0.6,
                  color: 'text.secondary',
                },
                '& .MuiIconButton-root': {
                  color: 'primary.main',
                  padding: '3px',
                  fontSize: '0.85rem',
                },
                '& .MuiIconButton-root svg': {
                  fontSize: '0.85rem',
                },
              },
            },
            layout: {
              sx: {
                backgroundColor: 'background.paper',
                borderRadius: 1,
                '.MuiPickersLayout-toolbar': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  padding: '16px',
                  borderRadius: '8px 8px 0 0',
                },
                '.MuiPickersLayout-contentWrapper': {
                  padding: '16px',
                  backgroundColor: 'background.paper',
                },
                '.MuiPickersCalendarHeader-root': {
                  paddingX: 2,
                  paddingY: 1.5,
                  gap: 2,
                },
                '.MuiPickersArrowSwitcher-root': {
                  gap: 1,
                },
                '.MuiPickersArrowSwitcher-button': {
                  backgroundColor: 'action.hover',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  minWidth: '44px',
                  minHeight: '44px',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                },
                '.MuiDayCalendar-header': {
                  paddingX: 2,
                  paddingY: 1,
                },
                '.MuiDayCalendar-weekContainer': {
                  marginTop: 0.5,
                },
                '.MuiPickersDay-root': {
                  margin: '4px 2px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  '&:hover:not(.Mui-disabled)': {
                    backgroundColor: 'action.hover',
                    transform: 'scale(1.05)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                  '&.MuiPickersDay-today:not(.Mui-selected)': {
                    border: '2px solid',
                    borderColor: 'primary.main',
                  },
                },
              },
            },
            popper: {
              sx: {
                '& .MuiPaper-root': {
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                },
              },
            },
          }}
          views={['year', 'month', 'day']}
          format="YYYY-MM-DD"
        />
      </LocalizationProvider>
      {error && (
        <FormHelperText error sx={{ mt: 0 }}>
          {typeof error === 'string' ? error : error.message || 'Invalid date'}
        </FormHelperText>
      )}
    </Box>
  );
};

CustomDatePicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.object]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CustomDatePicker;
