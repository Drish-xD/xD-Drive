import { defaultTimestamps } from "@/db/lib";
import { relations } from "drizzle-orm";
import { index, inet, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { activityTypeEnum } from "./enums";
import { resources } from "./resources";
import { users } from "./users";

/**
 * Table Definition
 */
export const activityLogs = pgTable(
	"activity_logs",
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		resourceId: uuid().references(() => resources.id, { onDelete: "set null" }),
		activityType: activityTypeEnum().notNull(),
		ipAddress: inet(),
		userAgent: text(),
		details: jsonb(),

		// Timestamps
		createdAt: defaultTimestamps.createdAt,
	},

	// Indexes
	(table) => [index("idx_activity_user").on(table.userId, table.createdAt), index("idx_activity_resource").on(table.resourceId, table.createdAt)],
);

/**
 * Relations
 */
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id],
	}),
	resouce: one(resources, {
		fields: [activityLogs.resourceId],
		references: [resources.id],
	}),
}));
