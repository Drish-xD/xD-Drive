import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType, omitTimestamps, z } from "@/db/lib";
import { resources } from "@/db/schema";

/**
 * Zod Schema
 */
export const selectResourceSchema = createSelectSchema(resources).meta({ title: "SelectResource" });

export const insertResourceSchema = createInsertSchema(resources, {
	isFavorite: (schema) => schema.default(false),
	name: (schema) => schema.min(1, { error: "Name is required" }),
	parentId: (schema) => schema.nullable().default(null),
})
	.omit({ id: true, ...omitTimestamps })
	.meta({ title: "InsertResource" });

export const updateResourceSchema = createUpdateSchema(resources).pick({ name: true, parentId: true, storagePath: true });

export const renameResourceSchema = updateResourceSchema
	.pick({ name: true })
	.extend({ name: z.string().trim().min(1, "Name is required") })
	.meta({ title: "RenameResource" });
export const moveResourceSchema = updateResourceSchema.pick({ parentId: true }).meta({ title: "MoveResource" });

export const createFolderSchema = insertResourceSchema.pick({ name: true }).extend({ parentId: z.string().optional() }).meta({ title: "CreateFolderPayload" });

export const uploadFileSchema = insertResourceSchema
	.pick({ parentId: true })
	.extend({ file: z.file().openapi({ description: "The file to upload", format: "binary", type: "string" }), parentId: z.uuid().optional() })
	.meta({ title: "UploadFilePayload" });

export type TResource = inferType<typeof selectResourceSchema>;
export type TInsertResource = inferType<typeof insertResourceSchema>;
export type TUpdateResource = inferType<typeof updateResourceSchema>;
export type TRenameResource = inferType<typeof renameResourceSchema>;
export type TMoveResource = inferType<typeof moveResourceSchema>;
export type TCreateFolder = inferType<typeof createFolderSchema>;
export type TUploadFile = inferType<typeof uploadFileSchema>;
