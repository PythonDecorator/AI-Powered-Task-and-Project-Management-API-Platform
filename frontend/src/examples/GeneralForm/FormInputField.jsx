import PropTypes from "prop-types";
import CustomBox from "../../components/CustomBox/index.jsx";
import CustomTypography from "../../components/CustomTypography/index.jsx";

import LoginInput from "../../components/LoginInput/index.jsx";
import CustomInputAutocomplete from "../../components/CustomInputAutocomplete/index.jsx";
import CustomFormInput from "../../components/CustomFormInput/index.jsx";

const FormInputField = ({label, type = "text", field, circular, options = [], ...rest}) => {
    const {meta} = field.state;
    const showError = meta.isTouched && meta.errors && meta.errors.length > 0;

    const InputComponent = circular ? LoginInput : CustomFormInput;

    return (
        <CustomBox mb={1}>
            {label && (
                <CustomTypography color="dark" variant="caption" mb={1}>
                    {label}
                </CustomTypography>
            )}

            {type === "select" ? (
                <CustomInputAutocomplete
                    id="status"
                    options={options}
                    field={field}
                    {...rest}
                />
            ) : (
                <InputComponent
                    type={type}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    error={showError}
                    {...rest}
                />
            )}

            {showError && (
                <CustomTypography color="error" fontWeight="small" sx={{fontSize: "12px"}} px={0.5}>
                    {meta.errors.join(", ")}
                </CustomTypography>
            )}
        </CustomBox>
    );
};

FormInputField.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    field: PropTypes.object.isRequired,
    circular: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.string), // Only needed for select
};

export default FormInputField;
