import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { tags } from "@/db/schema";

/**
 * Tags Schema
 */

export const selectTagSchema = createSelectSchema(tags).openapi("Tag");

export const insertTagSchema = createInsertSchema(tags).omit({ id: true, createdAt: true }).openapi("InsertTag");

export const updateTagSchema = createUpdateSchema(tags).omit({ id: true, createdAt: true }).partial().openapi("UpdateTag");

export type TTag = inferType<typeof selectTagSchema>;
