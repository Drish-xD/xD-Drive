import { defaultTimestamps } from "@/db/lib";
import { relations } from "drizzle-orm";
import { type AnyPgColumn, bigint, boolean, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { activityLogs } from "./activityLogs";
import { resourceStatusEnum } from "./enums";
import { permissions } from "./permissions";
import { resourceVersions } from "./resourceVersions";
import { tags } from "./tags";
import { users } from "./users";

/**
 * Table Definition
 */
export const resources = pgTable(
	"resources",
	{
		id: uuid().primaryKey().defaultRandom(),
		ownerId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: varchar({ length: 255 }).notNull(),
		parentId: uuid().references((): AnyPgColumn => resources.id, { onDelete: "cascade" }),
		isFolder: boolean().default(false).notNull(),
		storagePath: text().notNull(),
		status: resourceStatusEnum().default("active").notNull(),
		isFavorite: boolean().default(false).notNull(),

		// File specific fields
		mimeType: varchar({ length: 255 }),
		size: bigint({ mode: "number" }).notNull().default(0),
		contentHash: varchar({ length: 128 }),

		// Timestamps
		lastAccessedAt: timestamp(),
		deletedAt: timestamp(),
		...defaultTimestamps,
	},
	// Indexes
	(table) => [
		index("idx_resources_status").on(table.status),
		uniqueIndex("idx_resources_content_hash").on(table.contentHash),
		index("idx_resources_parent_id").on(table.parentId),
		index("idx_resources_owner_id").on(table.ownerId),
		index("idx_resources_name_parent").on(table.parentId, table.name, table.ownerId),
	],
);

/**
 * Relations
 */
export const resourcesRelations = relations(resources, ({ one, many }) => ({
	owner: one(users, {
		fields: [resources.ownerId],
		references: [users.id],
	}),
	parent: one(resources, {
		fields: [resources.parentId],
		references: [resources.id],
	}),
	children: many(resources, { relationName: "parent" }),
	versions: many(resourceVersions),
	permissions: many(permissions),
	tags: many(tags),
	activityLogs: many(activityLogs),
}));
