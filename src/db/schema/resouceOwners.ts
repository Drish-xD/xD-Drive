import { createInsertSchema, defaultTimestamps, type inferType } from "@/db/lib";
import { relations } from "drizzle-orm";
import { pgTable, unique, uuid } from "drizzle-orm/pg-core";
import { resources } from "./resources";
import { users } from "./users";

// Table
export const resourceOwners = pgTable(
	"resource_owners",
	{
		id: uuid().primaryKey().defaultRandom(),
		resourceId: uuid()
			.notNull()
			.references(() => resources.id),
		userId: uuid()
			.notNull()
			.references(() => users.id),
		...defaultTimestamps,
	},
	(table) => [unique().on(table.resourceId)],
);

// Relations
export const resouceOwnersRelations = relations(resourceOwners, ({ one }) => ({
	resource: one(resources, {
		fields: [resourceOwners.resourceId],
		references: [resources.id],
	}),
	owner: one(users, {
		fields: [resourceOwners.userId],
		references: [users.id],
	}),
}));

// Zod Schema
export const $ResourceOwner = createInsertSchema(resourceOwners);
export type TResourceOwner = inferType<typeof $ResourceOwner>;
