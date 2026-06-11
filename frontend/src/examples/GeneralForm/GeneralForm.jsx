import {useForm} from "@tanstack/react-form";
import {zodValidator} from "@tanstack/zod-form-adapter";
import {z} from "zod";
import CustomBox from "../../components/CustomBox/index.jsx";
import CustomButton from "../../components/CustomButton/index.jsx";
import FormInputField from "./FormInputField.jsx";
import {CircularProgress} from "@mui/material";

const GeneralForm = ({children, schema, onSubmit, reset = false, fieldProps = {}, buttonText}) => {
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

    const renderField = (name) => {
        const { type, placeholder, label, options, onChangeListener } = schema[name];

        return (
            <form.Field
                key={name}
                name={name}
                listeners={
                    onChangeListener
                        ? {
                            onChange: ({ value }) => {
                                onChangeListener(value, form); // Pass form to modify values dynamically
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
                    <CustomBox mb={2}>
                        <FormInputField
                            field={field}
                            type={type}
                            label={label}
                            options={options}
                            placeholder={placeholder}
                            {...(fieldProps[name] || {})}
                        />
                    </CustomBox>
                )}
            </form.Field>
        );
    };


    return (
        <CustomBox
            component="form"
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
        >
            <CustomBox>
                {Object.keys(schema).map((key) => renderField(key))}
            </CustomBox>
            {children && children}
            <CustomBox mt={3} mb={3}>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <CustomButton
                            size="large"
                            fullWidth
                            circular
                            type="submit"
                            variant="contained"
                            color="success"
                            disabled={!canSubmit}
                            sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
                        >
                            {isSubmitting && <CircularProgress size={20} color="secondary" />}
                            {isSubmitting ? "Submitting..." : buttonText}
                        </CustomButton>
                    )}
                />
            </CustomBox>
        </CustomBox>
    );
};

export default GeneralForm;
