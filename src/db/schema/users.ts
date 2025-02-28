import { defaultTimestamps } from "@/db/lib";
import { relations, sql } from "drizzle-orm";
import { bigint, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { activityLogs } from "./activityLogs";
import { userStatusEnum } from "./enums";
import { permissions } from "./permissions";
import { resourceVersions } from "./resourceVersions";
import { resources } from "./resources";
import { tags } from "./tags";

const STORAGE_QUOTA = 1073741824; // 1GB in bytes

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
		status: userStatusEnum().notNull().default("active"),

		// Storage
		storageQuota: bigint({ mode: "number" }).notNull().default(STORAGE_QUOTA),
		usedStorage: bigint({ mode: "number" }).notNull().default(0),

		// Timestamps
		lastLoginAt: timestamp(),
		deletedAt: timestamp(),
		...defaultTimestamps,
	},
	// Indexes
	(table) => [uniqueIndex("idx_users_email").on(sql`lower(${table.email})`)],
);

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
	resources: many(resources),
	createdVersions: many(resourceVersions, { relationName: "createdBy" }),
	permissions: many(permissions, { relationName: "grantedTo" }),
	createdPermissions: many(permissions, { relationName: "createdBy" }),
	createdTags: many(tags),
	activityLogs: many(activityLogs),
}));
