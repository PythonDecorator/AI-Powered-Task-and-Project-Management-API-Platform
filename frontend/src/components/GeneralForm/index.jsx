import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { CircularProgress, Box, Divider } from '@mui/material';
import CustomBox from '../CustomBox/index.jsx';
import CustomButton from '../CustomButton/index.jsx';
import CustomTypography from '../CustomTypography/index.jsx';
import FormInputField from '../FormInputField/index.jsx';

const GeneralForm = ({
  children,
  schema,
  onSubmit,
  buttonText = 'Submit',
  fieldProps = {},
  sections = {},
  spacing = 3,
  ...rest
}) => {
  const form = useForm({
    defaultValues: Object.fromEntries(
      Object.entries(schema).map(([key, { value }]) => [key, value])
    ),
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
    validatorAdapter: zodValidator(
      z.object(
        Object.fromEntries(
          Object.entries(schema).map(([key, { validation }]) => [
            key,
            validation,
          ])
        )
      )
    ),
  });

  const renderField = (name) => {
    const { type, placeholder, label, options, required, helperText, onChangeListener } = schema[name];

    return (
      <form.Field key={name} name={name}>
        {(field) => (
          <FormInputField
            field={field}
            type={type}
            label={label}
            options={options}
            placeholder={placeholder}
            required={required}
            helperText={helperText}
            onChangeListener={onChangeListener ? () => onChangeListener(field.state.value, form) : undefined}
            {...(fieldProps[name] || {})}
          />
        )}
      </form.Field>
    );
  };

  const schemaKeys = Object.keys(schema);
  const groupedFields = sections && Object.keys(sections).length > 0
    ? sections
    : { '': schemaKeys };

  return (
    <CustomBox
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      {...rest}
    >
      {Object.entries(groupedFields).map(([section, fieldNames], sectionIndex) => (
        <Box key={section}>
          {section && (
            <Box sx={{ mb: spacing }}>
              <CustomTypography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 2,
                }}
              >
                {section}
              </CustomTypography>
            </Box>
          )}

          <CustomBox sx={{ mb: spacing }}>
            {fieldNames.map((fieldName) => renderField(fieldName))}
          </CustomBox>

          {sectionIndex < Object.keys(groupedFields).length - 1 && (
            <Divider sx={{ my: spacing, borderColor: 'rgba(102, 126, 234, 0.1)' }} />
          )}
        </Box>
      ))}

      {children && children}

      <CustomBox mt={spacing}>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <CustomButton
              size="large"
              fullWidth
              type="submit"
              variant="contained"
              gradient
              disabled={!canSubmit || isSubmitting}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                transition: 'all 0.3s ease',
              }}
            >
              {isSubmitting && (
                <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
              )}
              {isSubmitting ? 'Submitting...' : buttonText}
            </CustomButton>
          )}
        />
      </CustomBox>
    </CustomBox>
  );
};

export default GeneralForm;
