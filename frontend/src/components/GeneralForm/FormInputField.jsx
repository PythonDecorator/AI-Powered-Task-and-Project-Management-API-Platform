import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import CustomSelect from "./CustomSelect.jsx";
import CustomSelectSingle from "./CustomSelectSingle.jsx";
import CustomFormInput from "./CustomFormInput.jsx";
import CustomDatePicker from "./CustomDatePicker.jsx";

const FormInputField = ({
  label,
  type = "text",
  field,
  options = [],
  placeholder,
  required = false,
  disabled = false,
  ...rest
}) => {
  const { meta } = field.state;
  const showError = meta.isTouched && meta.errors && meta.errors.length > 0;
  const errorMessage = showError ? meta.errors.join(", ") : false;

  return (
    <Box sx={{ width: '100%' }}>
      {type === "select" ? (
        rest.multiple ? (
          <CustomSelect
            label={label}
            placeholder={placeholder}
            options={options}
            field={field}
            error={errorMessage}
            required={required}
            {...rest}
          />
        ) : (
          <CustomSelectSingle
            label={label}
            placeholder={placeholder}
            options={options}
            field={field}
            error={errorMessage}
            required={required}
            {...rest}
          />
        )
      ) : type === "date" ? (
        <CustomDatePicker
          label={label}
          placeholder={placeholder}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          error={errorMessage}
          required={required}
          disabled={disabled}
          {...rest}
        />
      ) : (
        <CustomFormInput
          type={type}
          label={label}
          placeholder={placeholder}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          error={errorMessage}
          required={required}
          disabled={disabled}
          {...rest}
        />
      )}
    </Box>
  );
};

FormInputField.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  field: PropTypes.object.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
    })
  ),
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default FormInputField;
