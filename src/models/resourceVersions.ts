import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { resourceVersions } from "@/db/schema";

/**
 * Resource Versions Schema
 */

export const selectResourceVersionSchema = createSelectSchema(resourceVersions).meta({ id: "ResourceVersion" });

export const insertResourceVersionSchema = createInsertSchema(resourceVersions).omit({ createdAt: true, id: true });

export const updateResourceVersionSchema = createUpdateSchema(resourceVersions).omit({ createdAt: true, id: true }).partial();

export type TResourceVersion = inferType<typeof selectResourceVersionSchema>;
export type TInsertResourceVersion = inferType<typeof insertResourceVersionSchema>;
export type TUpdateResourceVersion = inferType<typeof updateResourceVersionSchema>;
