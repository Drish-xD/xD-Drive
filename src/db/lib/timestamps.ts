import { timestamp } from "drizzle-orm/pg-core";

export const defaultTimestamps = {
	updatedAt: timestamp()
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	createdAt: timestamp().defaultNow().notNull(),
} as const;

export const omitTimestamps = {
	updatedAt: true,
	createdAt: true,
} as const;
