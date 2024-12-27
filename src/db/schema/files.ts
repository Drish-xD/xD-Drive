import { relations } from "drizzle-orm";
import { bigint, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, type inferType } from "../lib";
import { resources } from "./resources";

// Table
export const files = pgTable("files", {
	id: uuid().defaultRandom().primaryKey(),
	resourceId: uuid()
		.notNull()
		.references(() => resources.id),
	mimeType: varchar({ length: 255 }).notNull(),
	size: bigint({ mode: "number" }).notNull(),
});

// Relations
export const filesRelation = relations(files, ({ one }) => ({
	file: one(resources, {
		fields: [files.resourceId],
		references: [resources.id],
	}),
}));

// Zod schema
export const $Files = createInsertSchema(files);
export type TFiles = inferType<typeof $Files>;
