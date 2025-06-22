import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { tags } from "@/db/schema";

/**
 * Tags Schema
 */

export const selectTagSchema = createSelectSchema(tags).meta({ title: "Tag" });

export const insertTagSchema = createInsertSchema(tags).omit({ createdAt: true, id: true }).meta({ title: "InsertTag" });

export const updateTagSchema = createUpdateSchema(tags).omit({ createdAt: true, id: true }).partial().meta({ title: "UpdateTag" });

export type TTag = inferType<typeof selectTagSchema>;
export type TInsertTag = inferType<typeof insertTagSchema>;
export type TUpdateTag = inferType<typeof updateTagSchema>;
