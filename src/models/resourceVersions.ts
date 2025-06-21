import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { resourceVersions } from "@/db/schema";

/**
 * Resource Versions Schema
 */

export const selectResourceVersionSchema = createSelectSchema(resourceVersions).meta({ title: "ResourceVersion" });

export const insertResourceVersionSchema = createInsertSchema(resourceVersions).omit({ id: true, createdAt: true }).meta({ title: "InsertResourceVersion" });

export const updateResourceVersionSchema = createUpdateSchema(resourceVersions).omit({ id: true, createdAt: true }).partial().meta({ title: "UpdateResourceVersion" });

export type TResourceVersion = inferType<typeof selectResourceVersionSchema>;
export type TInsertResourceVersion = inferType<typeof insertResourceVersionSchema>;
export type TUpdateResourceVersion = inferType<typeof updateResourceVersionSchema>;
