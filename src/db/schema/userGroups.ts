import { createInsertSchema, defaultTimestamps, type inferType } from "@/db/lib";
import { relations } from "drizzle-orm";
import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { groups } from "./groups";
import { users } from "./users";

// Table
export const userGroups = pgTable(
	"user_groups",
	{
		id: uuid().defaultRandom().notNull(),
		userId: uuid()
			.notNull()
			.references(() => users.id),
		groupId: uuid()
			.notNull()
			.references(() => groups.id),
		joinedAt: timestamp().notNull().defaultNow(),
		...defaultTimestamps,
	},
	(table) => [unique().on(table.userId, table.groupId)],
);

// Relations
export const userGroupsRelations = relations(userGroups, ({ one }) => ({
	user: one(users, {
		fields: [userGroups.userId],
		references: [users.id],
	}),
	group: one(groups, {
		fields: [userGroups.groupId],
		references: [groups.id],
	}),
}));

// Zod Schema
export const $UserGroup = createInsertSchema(userGroups);
export type TUserGroup = inferType<typeof $UserGroup>;
