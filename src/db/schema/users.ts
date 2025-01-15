import { createInsertSchema, createSelectSchema, createUpdateSchema, defaultTimestamps, type inferType, omitTimestamps } from "@/db/lib";
import { z } from "@hono/zod-openapi";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { resourceOwners } from "./resouceOwners";
import { resourceShared } from "./resourceShared";
import { userGroups } from "./userGroups";

export const UserStatus = pgEnum("user_status", ["active", "inactive", "deleted"]);

/**
 * Table Definition
 */
export const users = pgTable(
	"users",
	{
		id: uuid().defaultRandom().primaryKey(),
		fullName: varchar({ length: 255 }).notNull(),
		displayName: varchar({ length: 255 }).notNull().unique(),
		email: varchar({ length: 255 }).notNull().unique(),
		passwordHash: text().notNull(),
		emailVerifiedAt: timestamp(),
		status: UserStatus().notNull().default("active"),
		...defaultTimestamps,
	},
	(table) => [uniqueIndex("email_index").on(table.email)],
);

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
	userGroups: many(userGroups),
	resourceOwners: many(resourceOwners),

	resourceShared: many(resourceShared),
}));

/**
 * Zod Schema
 */
export const userExample = {
	id: "123e4567-e89b-12d3-a456-426614174000",
	fullName: "John Doe",
	displayName: "john_doe",
	email: "john.doe@mail.com",
	passwordHash: "password#hash",
	emailVerifiedAt: null,
	status: "active",
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
	password: "password",
} as const;

export const selectUserSchema = createSelectSchema(users)
	.omit({
		passwordHash: true,
	})
	.openapi("User", {
		example: {
			id: userExample.id,
			fullName: userExample.fullName,
			displayName: userExample.displayName,
			email: userExample.email,
			emailVerifiedAt: userExample.emailVerifiedAt,
			status: userExample.status,
			createdAt: userExample.createdAt,
			updatedAt: userExample.updatedAt,
			deletedAt: userExample.deletedAt,
		},
	});

export const insertUserSchema = createInsertSchema(users, {
	email: (schema) => schema.email(),
})
	.omit({
		id: true,
		passwordHash: true,
		...omitTimestamps,
	})
	.extend({
		password: z.string().min(8),
	})
	.openapi("InsertUser", {
		example: {
			displayName: userExample.displayName,
			email: userExample.email,
			password: userExample.password,
			fullName: userExample.fullName,
			emailVerifiedAt: userExample.emailVerifiedAt,
			status: userExample.status,
		},
	});

export const updateUserSchema = createUpdateSchema(users, {
	email: (schema) => schema.email(),
})
	.omit({
		id: true,
		passwordHash: true,
		...omitTimestamps,
	})
	.partial()
	.openapi("UpdateUser", {
		example: {
			displayName: userExample.displayName,
			fullName: userExample.fullName,
			email: userExample.email,
			emailVerifiedAt: userExample.emailVerifiedAt,
			status: userExample.status,
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
