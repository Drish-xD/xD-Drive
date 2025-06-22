import { eq, relations, sql } from "drizzle-orm";
import { bigint, boolean, index, integer, pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { defaultTimestamps } from "@/db/lib";
import { resources } from "./resources";
import { users } from "./users";

/**
 * Table Definition
 */
export const resourceVersions = pgTable(
	"resource_versions",
	{
		contentHash: varchar({ length: 128 }).notNull(),
		createdAt: defaultTimestamps.createdAt,
		createdBy: uuid()
			.notNull()
			.references(() => users.id),
		id: uuid().primaryKey().defaultRandom(),
		isCurrent: boolean().notNull().default(false),
		resourceId: uuid()
			.notNull()
			.references(() => resources.id, { onDelete: "cascade" }),
		size: bigint({ mode: "number" }).notNull(),
		storagePath: text().notNull(),

		// Versioning
		versionNumber: integer().notNull(),
	},
	(table) => [
		uniqueIndex("idx_resource_versions_number").on(table.versionNumber, table.resourceId),
		index("idx_versions_resource").on(table.resourceId),
		uniqueIndex("idx_versions_current").on(table.resourceId).where(eq(table.isCurrent, sql`true`)),
	],
);

/**
 * Relations
 */
export const resourceVersionsRelations = relations(resourceVersions, ({ one }) => ({
	createdBy: one(users, {
		fields: [resourceVersions.createdBy],
		references: [users.id],
	}),
	resource: one(resources, {
		fields: [resourceVersions.resourceId],
		references: [resources.id],
	}),
}));
