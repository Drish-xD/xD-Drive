import { relations } from "drizzle-orm";
import { index, inet, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { defaultTimestamps } from "@/db/lib";
import { activityTypeEnum } from "./enums";
import { resources } from "./resources";
import { users } from "./users";

/**
 * Table Definition
 */
export const activityLogs = pgTable(
	"activity_logs",
	{
		activityType: activityTypeEnum().notNull(),

		// Timestamps
		createdAt: defaultTimestamps.createdAt,
		details: jsonb(),
		id: uuid().primaryKey().defaultRandom(),
		ipAddress: inet(),
		resourceId: uuid().references(() => resources.id, { onDelete: "set null" }),
		userAgent: text(),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},

	// Indexes
	(table) => [index("idx_activity_user").on(table.userId, table.createdAt), index("idx_activity_resource").on(table.resourceId, table.createdAt)],
);

/**
 * Relations
 */
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
	resouce: one(resources, {
		fields: [activityLogs.resourceId],
		references: [resources.id],
	}),
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id],
	}),
}));
