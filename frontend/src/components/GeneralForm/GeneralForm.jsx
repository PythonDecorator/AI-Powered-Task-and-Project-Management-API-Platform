import {useForm} from "@tanstack/react-form";
import {zodValidator} from "@tanstack/zod-form-adapter";
import {z} from "zod";
import FormInputField from "./FormInputField.jsx";
import {CircularProgress, Button, Typography, Grid, Box} from "@mui/material";
import { styled } from "@mui/material/styles";

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

const GeneralForm = ({children, schema, onSubmit, reset = false, fieldProps = {}, buttonText, sections}) => {
    const form = useForm({
        defaultValues: Object.fromEntries(
            Object.entries(schema).map(([key, {value}]) => [key, value])
        ),
        onSubmit: async ({value}) => {
            await onSubmit(value);
        },
        validatorAdapter: zodValidator(
            z.object(
                Object.fromEntries(
                    Object.entries(schema).map(([key, {validation}]) => [key, validation])
                )
            )
        ),
    });

    const renderField = (name, gridSize = { xs: 12 }) => {
        const { type, placeholder, label, options, onChangeListener, required = false, disabled = false } = schema[name];

        return (
            <form.Field
                key={name}
                name={name}
                listeners={
                    onChangeListener
                        ? {
                            onChange: ({ value }) => {
                                onChangeListener(value, form);
                            },
                        }
                        : undefined
                }
                validators={{
                    onChange: schema[name].validation,
                    onChangeAsyncDebounceMs: 500,
                    onChangeAsync: schema[name].validation.refine(
                        async (value) => {
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            return !value.includes("error");
                        },
                        {
                            message: "No 'error' allowed",
                        }
                    ),
                }}
            >
                {(field) => (
                    <FormGrid size={gridSize}>
                        <FormInputField
                            field={field}
                            type={type}
                            label={label}
                            options={options}
                            placeholder={placeholder}
                            required={required}
                            disabled={disabled}
                            {...(fieldProps[name] || {})}
                        />
                    </FormGrid>
                )}
            </form.Field>
        );
    };


    const renderFields = () => {
        if (sections) {
            return Object.entries(sections).map(([sectionTitle, fieldNames]) => (
                <Box key={sectionTitle} sx={{ mb: 4, width: '100%' }}>
                    {sectionTitle && (
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, fontSize: '1.05rem', color: 'text.primary' }}>
                            {sectionTitle}
                        </Typography>
                    )}
                    <Grid container spacing={3}>
                        {fieldNames.map((fieldName) => renderField(fieldName))}
                    </Grid>
                </Box>
            ));
        }
        return (
            <Grid container spacing={3}>
                {Object.keys(schema).map((key) => renderField(key))}
            </Grid>
        );
    };

    return (
        <Box
            component="form"
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
            sx={{ width: '100%' }}
        >
            <Box sx={{ mb: 4, width: '100%' }}>
                {renderFields()}
            </Box>
            {children && children}
            <Box sx={{ mt: 5 }}>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            size="large"
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="success"
                            disabled={!canSubmit}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                            }}
                        >
                            {isSubmitting && <CircularProgress size={20} color="inherit" />}
                            {isSubmitting ? "Submitting..." : buttonText}
                        </Button>
                    )}
                />
            </Box>
        </Box>
    );
};

export default GeneralForm;
