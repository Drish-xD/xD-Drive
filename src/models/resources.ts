import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType, omitTimestamps, z } from "@/db/lib";
import { resources } from "@/db/schema";

/**
 * Zod Schema
 */
export const selectResourceSchema = createSelectSchema(resources).meta({ title: "Resource" });

export const insertResourceSchema = createInsertSchema(resources, {
	name: (schema) => schema.min(1, { error: "Name is required" }),
	parentId: (schema) => schema.nullable().default(null),
	isFavorite: (schema) => schema.default(false),
})
	.omit({ id: true, ...omitTimestamps })
	.meta({ title: "InsertResource" });

export const updateResourceSchema = createUpdateSchema(resources, {
	name: (schema) => schema.min(1, { error: "Name is required" }),
	parentId: (schema) => schema.nullable().default(null),
})
	.omit({ id: true, ...omitTimestamps })
	.partial()
	.meta({ title: "UpdateResource" });

export const createFolderSchema = insertResourceSchema.pick({ name: true, parentId: true }).meta({ title: "CreateFolderPayload" });

export const uploadFileSchema = insertResourceSchema
	.pick({ parentId: true })
	.extend({ file: z.file({ error: "Invalid file format" }) })
	.meta({ title: "UploadFilePayload" });

export type TResource = inferType<typeof selectResourceSchema>;
export type TInsertResource = inferType<typeof insertResourceSchema>;
export type TUpdateResource = inferType<typeof updateResourceSchema>;
export type TCreateFolder = inferType<typeof createFolderSchema>;
export type TUploadFile = inferType<typeof uploadFileSchema>;
