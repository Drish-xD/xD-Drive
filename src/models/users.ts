import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { users } from "@/db/schema";

/**
 * Example User
 */
const userExample = {
	id: "123e4567-e89b-12d3-a456-426614174000",
	fullName: "John Doe",
	displayName: "john_doe",
	email: "john.doe@mail.com",
	emailVerifiedAt: null,
	status: "active",
	createdAt: new Date(),
	updatedAt: new Date(),
	lastLoginAt: null,
	deletedAt: null,
	password: "password",
	storageQuota: 1073741824,
	usedStorage: 0,
} as const;

/**
 * Zod Schema
 */
export const selectUserSchema = createSelectSchema(users).omit({ passwordHash: true }).meta({ title: "User", example: userExample });

export const insertUserSchema = createInsertSchema(users, {
	email: () => z.email({ error: "Invalid email address" }),
	fullName: (schema) => schema.min(1, { error: "Full name is required" }),
	displayName: (schema) => schema.min(1, { error: "Display name is required" }),
})
	.pick({ email: true, fullName: true, displayName: true })
	.extend({ password: z.string().min(8) })
	.meta({
		title: "InsertUser",
		example: {
			displayName: userExample.displayName,
			email: userExample.email,
			fullName: userExample.fullName,
			password: userExample.password,
		},
	});

export const updateUserSchema = createUpdateSchema(users, {
	email: (schema) => schema.email(),
	fullName: (schema) => schema.min(1, { error: "Full name is required" }),
	displayName: (schema) => schema.min(1, { error: "Display name is required" }),
})
	.pick({ email: true, fullName: true, displayName: true })
	.partial()
	.meta({
		title: "UpdateUser",
		example: {
			displayName: userExample.displayName,
			fullName: userExample.fullName,
			email: userExample.email,
		},
	});

export const loginUserSchema = insertUserSchema
	.pick({
		email: true,
		password: true,
	})
	.meta({
		title: "LoginUser",
		example: {
			email: userExample.email,
			password: userExample.password,
		},
	});

export type TUser = inferType<typeof selectUserSchema>;
export type TInsertUser = inferType<typeof insertUserSchema>;
export type TUpdateUser = inferType<typeof updateUserSchema>;
export type TLoginUser = inferType<typeof loginUserSchema>;
