import { eq, relations } from "drizzle-orm";
import { boolean, pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { defaultTimestamps } from "../lib";
import { resources } from "./resources";
import { users } from "./users";

/**
 * Table Definition
 */
export const tags = pgTable(
	"tags",
	{
		id: uuid().primaryKey().defaultRandom(),
		name: varchar({ length: 255 }).notNull(),
		createdBy: uuid().references(() => users.id, { onDelete: "set null" }),
		isSystemGenerated: boolean().default(false).notNull(),
		createdAt: defaultTimestamps.createdAt,
	},

	// Indexes
	(table) => [uniqueIndex("idx_tags_name_creatr").on(table.name, table.createdBy), uniqueIndex("idx_tags_name_system").on(table.name).where(eq(table.isSystemGenerated, true))],
);

/**
 * Relations
 */
export const tagsRelations = relations(tags, ({ many, one }) => ({
	resources: many(resources),
	creator: one(users, {
		fields: [tags.createdBy],
		references: [users.id],
	}),
}));
