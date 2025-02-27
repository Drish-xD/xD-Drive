import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { users } from "@/db/schema";
import { z } from "@hono/zod-openapi";

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
export const selectUserSchema = createSelectSchema(users).omit({ passwordHash: true }).openapi("User", { example: userExample });

export const insertUserSchema = createInsertSchema(users, {
	email: (schema) => schema.email(),
})
	.pick({ email: true, fullName: true, displayName: true })
	.extend({ password: z.string().min(8) })
	.openapi("InsertUser", {
		example: {
			displayName: userExample.displayName,
			email: userExample.email,
			fullName: userExample.fullName,
			password: userExample.password,
		},
	});

export const updateUserSchema = createUpdateSchema(users, {
	email: (schema) => schema.email(),
})
	.pick({ email: true, fullName: true, displayName: true })
	.partial()
	.openapi("UpdateUser", {
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
	.openapi("LoginUser", {
		example: {
			email: userExample.email,
			password: userExample.password,
		},
	});

export type TUser = inferType<typeof selectUserSchema>;
