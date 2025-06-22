import { isNotNull, relations, sql } from "drizzle-orm";
import { boolean, check, index, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { defaultTimestamps } from "@/db/lib";
import { accessLevelEnum } from "./enums";
import { resources } from "./resources";
import { users } from "./users";

/**
 * Table Definition
 */
export const resourceShares = pgTable(
	"resource_shares",
	{
		accessLevel: accessLevelEnum().notNull().default("viewer"),
		createdBy: uuid()
			.notNull()
			.references(() => users.id),

		// Timestamps
		expiresAt: timestamp(),

		grantedTo: uuid().references(() => resources.id, { onDelete: "cascade" }),
		id: uuid().primaryKey().defaultRandom(),
		isPublic: boolean().notNull().default(false),
		publicLinkToken: varchar({ length: 128 }),
		resourceId: uuid()
			.notNull()
			.references(() => resources.id, { onDelete: "cascade" }),
		...defaultTimestamps,
	},

	(table) => [
		// Indexes & Constraints
		check("check_valid_resource_share", sql`(${table.isPublic} = true AND ${table.grantedTo} IS NULL) OR (${table.isPublic} = false AND ${table.grantedTo} IS NOT NULL)`),
		index("idx_resource_shares_resource").on(table.resourceId),
		index("idx_resource_shares_user").on(table.grantedTo).where(isNotNull(table.grantedTo)),
		uniqueIndex("idx_resource_shares_public_link").on(table.publicLinkToken).where(isNotNull(table.publicLinkToken)),
	],
);

/**
 * Relations
 */
export const resourceSharesRelations = relations(resourceShares, ({ one }) => ({
	creator: one(users, {
		fields: [resourceShares.createdBy],
		references: [users.id],
		relationName: "creator",
	}),
	grantedToUser: one(users, {
		fields: [resourceShares.grantedTo],
		references: [users.id],
		relationName: "granted",
	}),
	resource: one(resources, {
		fields: [resourceShares.resourceId],
		references: [resources.id],
	}),
}));
