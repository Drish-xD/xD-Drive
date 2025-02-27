import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { resourceVersions } from "@/db/schema";

/**
 * Resource Versions Schema
 */

export const selectResourceVersionSchema = createSelectSchema(resourceVersions).openapi("ResourceVersion");

export const insertResourceVersionSchema = createInsertSchema(resourceVersions).omit({ id: true, createdAt: true }).openapi("InsertResourceVersion");

export const updateResourceVersionSchema = createUpdateSchema(resourceVersions).omit({ id: true, createdAt: true }).partial().openapi("UpdateResourceVersion");

export type TResourceVersion = inferType<typeof selectResourceVersionSchema>;
