import {z} from "zod";

 export const loginSchema = {
    email: {
        value: "",
        type: "email",
        label: "Email Address",
        placeholder: "email@email.com",
        validation: z.string().email("Please enter a valid email address"),
    },
    pword: {
        value: "",
        type: "password",
        label: "Password",
        placeholder: "*********",
        validation: z.string().min(8, "Password must be at least 8 characters long"),
    },
};

