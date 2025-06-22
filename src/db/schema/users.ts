import { relations } from "drizzle-orm";
import { bigint, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { defaultTimestamps, lower } from "@/db/lib";
import { activityLogs } from "./activityLogs";
import { userStatusEnum } from "./enums";
import { resourceShares } from "./resourceShares";
import { resources } from "./resources";
import { resourceVersions } from "./resourceVersions";
import { tags } from "./tags";

const STORAGE_QUOTA = 1073741824; // 1GB in bytes

/**
 * Table Definition
 */
export const users = pgTable(
	"users",
	{
		deletedAt: timestamp(),
		displayName: varchar({ length: 255 }).notNull().unique(),
		email: varchar({ length: 255 }).notNull().unique(),
		emailVerifiedAt: timestamp(),
		fullName: varchar({ length: 255 }).notNull(),
		id: uuid().defaultRandom().primaryKey(),

		// Timestamps
		lastLoginAt: timestamp(),
		passwordHash: text().notNull(),
		status: userStatusEnum().notNull().default("active"),

		// Storage
		storageQuota: bigint({ mode: "number" }).notNull().default(STORAGE_QUOTA),
		usedStorage: bigint({ mode: "number" }).notNull().default(0),
		...defaultTimestamps,
	},
	// Indexes
	(table) => [uniqueIndex("idx_users_email").on(lower(table.email))],
);

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
	activityLogs: many(activityLogs),
	createdShares: many(resourceShares, { relationName: "createdBy" }),
	createdTags: many(tags),
	createdVersions: many(resourceVersions, { relationName: "createdBy" }),
	resources: many(resources),
	shares: many(resourceShares, { relationName: "grantedTo" }),
}));
