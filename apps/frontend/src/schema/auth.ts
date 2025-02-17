import { z } from "zod";

export const loginSchema = z.object({
	username: z.union([z.string().email().min(1), z.string().min(1)]),
	password: z.string().min(1),
});

//only for admin
//!!! DO NOT MAKE IT PUBLIC
export const adminUpdateUserDetailSchema = z.object({
	name: z.string().min(1),
	email: z.string().email().min(1),
	image: z.string().nullable(),
	role: z.string().min(1).nullable(),
	username: z.string().min(1).nullable(),
});

export const adminCreateUserDetailSchema = z
	.object({
		name: z.string().min(1),
		email: z.string().email().min(1),
		password: z.string().min(8),
		confirmPassword: z.string().min(8),
		role: z.enum(["user", "admin"]).default("user"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		params: {
			i18n: "password_mismatch",
		},
	});

export const updateUserSchema = z.object({
	name: z.string().min(1),
	username: z.string().min(1),
});

export const updatePasswordSchema = z
	.object({
		oldPassword: z.string().min(1),
		newPassword: z.string().min(8),
		confirmPassword: z.string().min(8),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		path: ["confirmPassword"],
		params: {
			i18n: "password_mismatch",
		},
	});

export const createUserSchema = z
	.object({
		email: z.string().email().min(1),
		username: z.string().min(1),
		name: z.string().min(1),
		password: z.string({}).min(8),
		confirmPassword: z.string().min(8),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		params: {
			i18n: "password_mismatch",
		},
	});

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
export type UpdatePasswordSchemaType = z.infer<typeof updatePasswordSchema>;
export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
