import z from "zod";

export const loginSchema = z.object({
    email: z.email("Email is required"),
    password: z.string("Password is required").min(8, "Password must be minimum of 8 Characters,").max(64)
});

export const signUpSchema = z.object({
    name: z.string("Full name is required").min(2).max(32),
    email: z.email("Email is required"),
    password: z.string("Password is required").min(8, "Password must be minimum of 8 Characters,").max(64)
});

export type LoginSchemaType = z.infer<typeof loginSchema>
export type SignupSchemaType = z.infer<typeof signUpSchema>

