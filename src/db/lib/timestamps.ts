import { timestamp } from "drizzle-orm/pg-core";

export const defaultTimestamps = {
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp()
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
} as const;

export const omitTimestamps = {
	createdAt: true,
	updatedAt: true,
} as const;
