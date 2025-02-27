import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { defaultTimestamps } from "../lib";
import { resources } from "./resources";
import { tags } from "./tags";
import { users } from "./users";

/**
 * Table Definition
 */
export const resourceTags = pgTable(
	"resource_tags",
	{
		tagId: uuid()
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
		resourceId: uuid()
			.notNull()
			.references(() => resources.id, { onDelete: "cascade" }),
		createdBy: uuid().references(() => users.id, { onDelete: "cascade" }),
		createdAt: defaultTimestamps.createdAt,

		// AI generated tags
		isAiGenerated: boolean().default(false).notNull(),
		confidenceScore: integer(),
	},

	(table) => [
		// Primary key
		primaryKey({ columns: [table.tagId, table.resourceId] }),
		// Indexes
		index("idx_resource_tags_tag_id").on(table.tagId),
	],
);

/**
 * Relations
 */
export const resourceTagsRelations = relations(resourceTags, ({ one }) => ({
	resource: one(resources, {
		fields: [resourceTags.resourceId],
		references: [resources.id],
	}),
	creator: one(users, {
		fields: [resourceTags.createdBy],
		references: [users.id],
	}),
	tag: one(tags, {
		fields: [resourceTags.tagId],
		references: [tags.id],
	}),
}));
