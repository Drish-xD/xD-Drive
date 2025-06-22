import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType, omitTimestamps } from "@/db/lib";
import { resourceShares } from "@/db/schema";

/**
 * Resource Shares Schema
 */
export const selectResourceShareSchema = createSelectSchema(resourceShares).meta({ id: "ResourceShare" });

export const insertResourceShareSchema = createInsertSchema(resourceShares).omit({ id: true, ...omitTimestamps });

export const updateResourceShareSchema = createUpdateSchema(resourceShares)
	.omit({ id: true, ...omitTimestamps })
	.partial();

export type TResourceShare = inferType<typeof selectResourceShareSchema>;
export type TInsertResourceShare = inferType<typeof insertResourceShareSchema>;
export type TUpdateResourceShare = inferType<typeof updateResourceShareSchema>;
