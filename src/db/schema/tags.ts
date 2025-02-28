import { defaultTimestamps } from "@/db/lib";
import { eq, relations, sql } from "drizzle-orm";
import { boolean, pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
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
		isSystemGenerated: boolean().notNull().default(false),
		createdBy: uuid().references(() => users.id, { onDelete: "set null" }),
		createdAt: defaultTimestamps.createdAt,
	},

	// Indexes
	(table) => [
		uniqueIndex("idx_tags_name_system").on(table.name).where(eq(table.isSystemGenerated, sql`true`)),
		uniqueIndex("idx_tags_name_creator").on(table.name, table.createdBy),
	],
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
