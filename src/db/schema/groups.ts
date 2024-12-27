import { defaultTimestamps } from "@/db/lib";
import { relations } from "drizzle-orm";
import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
import { userGroups } from "./userGroups";
import { users } from "./users";

// Table
export const groups = pgTable("groups", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdBy: uuid()
		.notNull()
		.references(() => users.id),
	...defaultTimestamps,
});

// Relations
export const groupsRelations = relations(groups, ({ many }) => ({
	groups: many(userGroups),
}));

// Zod schema
export const $Group = createInsertSchema(groups);
export type TGroup = z.infer<typeof $Group>;
