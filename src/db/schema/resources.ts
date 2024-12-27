import { createInsertSchema, defaultTimestamps, type inferType } from "@/db/lib";
import { relations } from "drizzle-orm";
import { type AnyPgColumn, boolean, pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { files } from "./files";
import { folders } from "./folders";
import { resourceOwners } from "./resouceOwners";
import { resourceShared } from "./resourceShared";

export const ResourceType = pgEnum("resource_type", ["file", "folder"]);
export const ResourceStatus = pgEnum("resource_status", ["active", "deleted", "archived"]);

// Table
export const resources = pgTable("resources", {
	id: uuid().primaryKey().defaultRandom(),
	resourceType: ResourceType().notNull(),
	parentId: uuid().references((): AnyPgColumn => resources.id),
	name: varchar({ length: 255 }).notNull(),
	path: text().notNull(),
	status: ResourceStatus().default("active").notNull(),
	isFavorite: boolean().default(false).notNull(),
	...defaultTimestamps,
});

// Relations
export const resourcesRelations = relations(resources, ({ one, many }) => ({
	parent: one(resources, {
		fields: [resources.parentId],
		references: [resources.id],
	}),
	children: many(resources),
	folder: one(folders, {
		fields: [resources.id],
		references: [folders.resourceId],
	}),
	file: one(files, {
		fields: [resources.id],
		references: [files.resourceId],
	}),
	resourceOwner: many(resourceOwners),
	resourceShared: many(resourceShared),
}));

// Zod Schema
export const $ResourcesSchema = createInsertSchema(resources);
export type TResources = inferType<typeof $ResourcesSchema>;
