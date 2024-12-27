import { createInsertSchema, defaultTimestamps, type inferType } from "@/db/lib";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { resources } from "./resources";
import { users } from "./users";

export const EntityType = pgEnum("entity_type", ["user", "group"]);
export const AccessLevel = pgEnum("access_level", ["viewer", "editor", "commenter"]);

// Table
export const resourceShared = pgTable(
	"resource_shared",
	{
		id: uuid().primaryKey().defaultRandom(),
		resourceId: uuid()
			.notNull()
			.references(() => resources.id),
		entityId: uuid().notNull(),
		entityType: EntityType().notNull(),
		accessLevel: AccessLevel().notNull(),
		sharedBy: uuid()
			.notNull()
			.references(() => users.id),
		expiresAt: timestamp(),
		...defaultTimestamps,
	},
	(table) => [unique().on(table.resourceId, table.entityId, table.entityType)],
);

// Relations
export const resourceSharedRelations = relations(resourceShared, ({ one }) => ({
	resource: one(resources, {
		fields: [resourceShared.resourceId],
		references: [resources.id],
	}),
	sharedBy: one(users, {
		fields: [resourceShared.sharedBy],
		references: [users.id],
	}),
}));

// Zod schema
export const $ResourceShared = createInsertSchema(resourceShared);
export type TResourceShared = inferType<typeof $ResourceShared>;
