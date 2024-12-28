import { createInsertSchema, defaultTimestamps, type inferType } from "@/db/lib";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { resourceOwners } from "./resouceOwners";
import { resourceShared } from "./resourceShared";
import { userGroups } from "./userGroups";

export const UserStatus = pgEnum("user_status", ["active", "inactive", "deleted"]);

// Table
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	userGroups: many(userGroups),
	resourceOwners: many(resourceOwners),
	resourceShared: many(resourceShared),
}));

// Zod schema
export const $User = createInsertSchema(users).openapi("User");
export type TUser = inferType<typeof $User>;
