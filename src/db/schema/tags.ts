import { eq, relations, sql } from "drizzle-orm";
import { boolean, pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { defaultTimestamps } from "@/db/lib";
import { resources } from "./resources";
import { users } from "./users";

/**
 * Table Definition
 */
export const tags = pgTable(
	"tags",
	{
		createdAt: defaultTimestamps.createdAt,
		createdBy: uuid().references(() => users.id, { onDelete: "set null" }),
		id: uuid().primaryKey().defaultRandom(),
		isAiGenerated: boolean().notNull().default(false),
		name: varchar({ length: 255 }).notNull(),
	},

	// Indexes
	(table) => [uniqueIndex("idx_tags_name_system").on(table.name).where(eq(table.isAiGenerated, sql`true`)), uniqueIndex("idx_tags_name_creator").on(table.name, table.createdBy)],
);

/**
 * Relations
 */
export const tagsRelations = relations(tags, ({ many, one }) => ({
	creator: one(users, {
		fields: [tags.createdBy],
		references: [users.id],
	}),
	resources: many(resources),
}));
