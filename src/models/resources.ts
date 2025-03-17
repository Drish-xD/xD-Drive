import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType, omitTimestamps } from "@/db/lib";
import { resources } from "@/db/schema";
import { z } from "zod";

/**
 * Zod Schema
 */
export const selectResourceSchema = createSelectSchema(resources).openapi("Resource");

export const insertResourceSchema = createInsertSchema(resources, {
	name: (schema) => schema.min(1, { message: "Name is required" }),
	parentId: (schema) => schema.nullable().default(null),
	isFavorite: (schema) => schema.default(false),
})
	.omit({ id: true, ...omitTimestamps })
	.openapi("InsertResource");

export const updateResourceSchema = createUpdateSchema(resources, {
	name: (schema) => schema.min(1, { message: "Name is required" }),
	parentId: (schema) => schema.nullable().default(null),
})
	.omit({ id: true, ...omitTimestamps })
	.partial()
	.openapi("UpdateResource");

export const createFolderSchema = insertResourceSchema.pick({ name: true, parentId: true }).openapi("CreateFolderPayload");

export const uploadFileSchema = insertResourceSchema
	.pick({ parentId: true })
	.extend({ file: z.instanceof(File, { message: "Invalid file format" }) })
	.openapi("UploadFilePayload");

export type TResource = inferType<typeof selectResourceSchema>;
export type TInsertResource = inferType<typeof insertResourceSchema>;
export type TUpdateResource = inferType<typeof updateResourceSchema>;
export type TCreateFolder = inferType<typeof createFolderSchema>;
export type TUploadFile = inferType<typeof uploadFileSchema>;
