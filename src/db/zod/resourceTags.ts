import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { resourceTags } from "@/db/schema";

/**
 * Resource Tags Schema
 */
export const selectResourceTagSchema = createSelectSchema(resourceTags).openapi("ResourceTag");

export const insertResourceTagSchema = createInsertSchema(resourceTags).omit({ createdAt: true }).openapi("InsertResourceTag");

export const updateResourceTagSchema = createUpdateSchema(resourceTags).omit({ createdAt: true }).partial().openapi("UpdateResourceTag");

export type TResourceTag = inferType<typeof selectResourceTagSchema>;
