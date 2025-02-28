import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType, omitTimestamps } from "@/db/lib";
import { resources } from "@/db/schema";

/**
 * Zod Schema
 */
export const selectResourceSchema = createSelectSchema(resources).openapi("Resource");

export const insertResourceSchema = createInsertSchema(resources)
	.omit({ id: true, ...omitTimestamps })
	.openapi("InsertResource");

export const updateResourceSchema = createUpdateSchema(resources)
	.omit({ id: true, ...omitTimestamps })
	.partial()
	.openapi("UpdateResource");

export type TResource = inferType<typeof selectResourceSchema>;
export type TInsertResource = inferType<typeof insertResourceSchema>;
export type TUpdateResource = inferType<typeof updateResourceSchema>;
