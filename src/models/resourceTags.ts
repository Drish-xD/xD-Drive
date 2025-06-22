import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { resourceTags } from "@/db/schema";

/**
 * Resource Tags Schema
 */
export const selectResourceTagSchema = createSelectSchema(resourceTags).meta({ id: "ResourceTag" });

export const insertResourceTagSchema = createInsertSchema(resourceTags).omit({ createdAt: true });

export const updateResourceTagSchema = createUpdateSchema(resourceTags).omit({ createdAt: true }).partial();

export type TResourceTag = inferType<typeof selectResourceTagSchema>;
export type TInsertResourceTag = inferType<typeof insertResourceTagSchema>;
export type TUpdateResourceTag = inferType<typeof updateResourceTagSchema>;
