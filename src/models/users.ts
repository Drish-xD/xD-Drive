import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { users } from "@/db/schema";

/**
 * Example User
 */
const userExample = {
	createdAt: new Date(),
	deletedAt: null,
	displayName: "john_doe",
	email: "john.doe@mail.com",
	emailVerifiedAt: null,
	fullName: "John Doe",
	id: "123e4567-e89b-12d3-a456-426614174000",
	lastLoginAt: null,
	password: "password",
	status: "active",
	storageQuota: 1073741824,
	updatedAt: new Date(),
	usedStorage: 0,
} as const;

/**
 * Zod Schema
 */
export const selectUserSchema = createSelectSchema(users).omit({ passwordHash: true }).meta({ example: userExample, id: "User" });

export const insertUserSchema = createInsertSchema(users, {
	displayName: (schema) => schema.min(1, { error: "Display name is required" }),
	email: () => z.email({ error: "Invalid email address" }),
	fullName: (schema) => schema.min(1, { error: "Full name is required" }),
})
	.pick({ displayName: true, email: true, fullName: true })
	.extend({ password: z.string().min(8) })
	.meta({
		example: {
			displayName: userExample.displayName,
			email: userExample.email,
			fullName: userExample.fullName,
			password: userExample.password,
		},
	});

export const updateUserSchema = createUpdateSchema(users, {
	displayName: (schema) => schema.min(1, { error: "Display name is required" }),
	email: (schema) => schema.email(),
	fullName: (schema) => schema.min(1, { error: "Full name is required" }),
})
	.pick({ displayName: true, email: true, fullName: true })
	.partial()
	.meta({
		example: {
			displayName: userExample.displayName,
			email: userExample.email,
			fullName: userExample.fullName,
		},
	});

export const loginUserSchema = insertUserSchema
	.pick({
		email: true,
		password: true,
	})
	.meta({
		example: {
			email: userExample.email,
			password: userExample.password,
		},
	});

export type TUser = inferType<typeof selectUserSchema>;
export type TInsertUser = inferType<typeof insertUserSchema>;
export type TUpdateUser = inferType<typeof updateUserSchema>;
export type TLoginUser = inferType<typeof loginUserSchema>;
