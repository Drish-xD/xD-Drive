import { createInsertSchema, type inferType } from "@/db/lib";
import { relations } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { resources } from "./resources";

// Table
export const folders = pgTable("folders", {
	id: uuid().defaultRandom().primaryKey(),
	resourceId: uuid()
		.notNull()
		.references(() => resources.id),
});

// Relations
export const foldersRelation = relations(folders, ({ one }) => ({
	folder: one(resources, {
		fields: [folders.resourceId],
		references: [resources.id],
	}),
}));

// Zod schema
export const $Folder = createInsertSchema(folders);
export type TFolder = inferType<typeof $Folder>;
