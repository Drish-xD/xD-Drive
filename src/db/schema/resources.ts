import { relations } from "drizzle-orm";
import { type AnyPgColumn, bigint, boolean, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { defaultTimestamps } from "@/db/lib";
import { activityLogs } from "./activityLogs";
import { resourceStatusEnum } from "./enums";
import { resourceShares } from "./resourceShares";
import { resourceVersions } from "./resourceVersions";
import { tags } from "./tags";
import { users } from "./users";

/**
 * Table Definition
 */
export const resources = pgTable(
	"resources",
	{
		contentHash: varchar({ length: 128 }),
		deletedAt: timestamp(),
		id: uuid().primaryKey().defaultRandom(),
		isFavorite: boolean().default(false).notNull(),
		isFolder: boolean().default(false).notNull(),

		// Timestamps
		lastAccessedAt: timestamp(),

		// File specific fields
		mimeType: varchar({ length: 255 }),
		name: varchar({ length: 255 }).notNull(),
		ownerId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		parentId: uuid().references((): AnyPgColumn => resources.id, { onDelete: "cascade" }),
		size: bigint({ mode: "number" }).notNull().default(0),
		status: resourceStatusEnum().default("active").notNull(),
		storagePath: text().notNull(),
		...defaultTimestamps,
	},
	// Indexes
	(table) => [
		index("idx_resources_status").on(table.status),
		uniqueIndex("idx_resources_content_hash").on(table.contentHash, table.parentId, table.ownerId),
		index("idx_resources_parent_id").on(table.parentId),
		index("idx_resources_owner_id").on(table.ownerId),
		index("idx_resources_name_parent").on(table.parentId, table.name, table.ownerId),
	],
);

/**
 * Relations
 */
export const resourcesRelations = relations(resources, ({ one, many }) => ({
	activityLogs: many(activityLogs),
	children: many(resources, { relationName: "parent" }),
	owner: one(users, {
		fields: [resources.ownerId],
		references: [users.id],
	}),
	parent: one(resources, {
		fields: [resources.parentId],
		references: [resources.id],
	}),
	shares: many(resourceShares),
	tags: many(tags),
	versions: many(resourceVersions),
}));
