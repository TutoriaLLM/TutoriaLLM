import { z } from "zod";

export const loginSchema = z.object({
	username: z.union([
		z
			.string({ message: "Username is required" })
			.email()
			.min(1, { message: "Username is required" }),
		z
			.string({ message: "Username is required" })
			.min(1, { message: "Username is required" }),
	]),
	password: z
		.string({ message: "Password is required" })
		.min(1, { message: "Password is required" }),
});

export const updateUserSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	username: z.string().min(1, { message: "Username is required" }),
});

export const updatePasswordSchema = z
	.object({
		oldPassword: z.string().min(1, { message: "Old password is required" }),
		newPassword: z.string().min(8, { message: "Password is too short." }),
		confirmPassword: z.string().min(8, { message: "Password is too short." }),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "New password and confirm password must match",
		path: ["confirmPassword"],
	});

export const createUserSchema = z.object({
	email: z.string().email().min(1, { message: "Email is required" }),
	username: z.string().min(1, { message: "Username is required" }),
	name: z.string().min(1, { message: "Name is required" }),
	password: z
		.string({
			message: "Password is required",
		})
		.min(8, { message: "Password is too short" }),
	confirmpassword: z.string().min(8, { message: "Password is too short" }),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
export type UpdatePasswordSchemaType = z.infer<typeof updatePasswordSchema>;
export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
