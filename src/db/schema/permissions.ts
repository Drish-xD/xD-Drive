import { defaultTimestamps } from "@/db/lib";
import { isNotNull, relations, sql } from "drizzle-orm";
import { boolean, check, index, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { accessLevelEnum } from "./enums";
import { resources } from "./resources";
import { users } from "./users";

/**
 * Table Definition
 */
export const permissions = pgTable(
	"permissions",
	{
		id: uuid().primaryKey().defaultRandom(),
		resourceId: uuid()
			.notNull()
			.references(() => resources.id, { onDelete: "cascade" }),

		grantedTo: uuid().references(() => resources.id, { onDelete: "cascade" }),
		isPublic: boolean().notNull().default(false),
		accessLevel: accessLevelEnum().notNull().default("viewer"),
		publicLinkToken: varchar({ length: 128 }),
		createdBy: uuid()
			.notNull()
			.references(() => users.id),

		// Timestamps
		expiresAt: timestamp(),
		...defaultTimestamps,
	},

	(table) => [
		// Indexes & Constraints
		check("check_valid_permission", sql`(${table.isPublic} = true AND ${table.grantedTo} IS NULL) OR (${table.isPublic} = false AND ${table.grantedTo} IS NOT NULL)`),
		index("idx_permissions_resource").on(table.resourceId),
		index("idx_permissions_user").on(table.grantedTo).where(isNotNull(table.grantedTo)),
		uniqueIndex("idx_permissions_public_link").on(table.publicLinkToken).where(isNotNull(table.publicLinkToken)),
	],
);

/**
 * Relations
 */
export const permissionsRelations = relations(permissions, ({ one }) => ({
	resource: one(resources, {
		fields: [permissions.resourceId],
		references: [resources.id],
	}),
	grantedToUser: one(users, {
		fields: [permissions.grantedTo],
		references: [users.id],
		relationName: "granted",
	}),
	creator: one(users, {
		fields: [permissions.createdBy],
		references: [users.id],
		relationName: "creator",
	}),
}));
