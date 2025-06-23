import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType, omitTimestamps, z } from "@/db/lib";
import { resources } from "@/db/schema";

/**
 * Zod Schema
 */
export const selectResourceSchema = createSelectSchema(resources).meta({ id: "Resource" });

export const insertResourceSchema = createInsertSchema(resources, {
	isFavorite: (schema) => schema.default(false),
	name: (schema) => schema.min(1, { error: "Name is required" }),
	parentId: (schema) => schema.nullable().default(null),
}).omit({ id: true, ...omitTimestamps });

export const updateResourceSchema = createUpdateSchema(resources).pick({ name: true, parentId: true, storagePath: true });

export const renameResourceSchema = updateResourceSchema.pick({ name: true }).extend({ name: z.string().trim().min(1, "Name is required") });

export const moveResourceSchema = updateResourceSchema.pick({ parentId: true });

export const createFolderSchema = insertResourceSchema.pick({ name: true }).extend({ parentId: z.string().optional() });

export const uploadFileSchema = insertResourceSchema
	.pick({ parentId: true })
	.extend({ file: z.file().openapi({ description: "The file to upload", format: "binary", type: "string" }), parentId: z.uuid().optional() });

export const downloadResourceSchema = selectResourceSchema.pick({ createdAt: true, id: true, mimeType: true, name: true, updatedAt: true }).extend({ url: z.url() });

export const downloadResourceQuerySchema = z.object({ token: z.string().optional() });

export type TResource = inferType<typeof selectResourceSchema>;
export type TInsertResource = inferType<typeof insertResourceSchema>;
export type TUpdateResource = inferType<typeof updateResourceSchema>;
export type TRenameResource = inferType<typeof renameResourceSchema>;
export type TMoveResource = inferType<typeof moveResourceSchema>;
export type TCreateFolder = inferType<typeof createFolderSchema>;
export type TUploadFile = inferType<typeof uploadFileSchema>;
