import { timestamp } from "drizzle-orm/pg-core";

export const defaultTimestamps = {
	updatedAt: timestamp().defaultNow().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	deletedAt: timestamp(),
};

export { createInsertSchema } from "drizzle-zod";
export type { infer as inferType } from "zod";
