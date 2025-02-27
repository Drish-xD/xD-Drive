import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { activityLogs } from "@/db/schema";

/**
 * Activity Logs Schema
 */

export const selectActivityLogSchema = createSelectSchema(activityLogs).openapi("ActivityLog");

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true }).openapi("InsertActivityLog");

export const updateActivityLogSchema = createUpdateSchema(activityLogs).omit({ id: true, createdAt: true }).partial().openapi("UpdateActivityLog");

export type TActivityLog = inferType<typeof selectActivityLogSchema>;
