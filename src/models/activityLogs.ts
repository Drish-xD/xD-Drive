import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType } from "@/db/lib";
import { activityLogs } from "@/db/schema";

/**
 * Activity Logs Schema
 */

export const selectActivityLogSchema = createSelectSchema(activityLogs).meta({ id: "ActivityLog" });

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ createdAt: true, id: true, userId: true });

export const updateActivityLogSchema = createUpdateSchema(activityLogs).omit({ createdAt: true, id: true }).partial();

export type TActivityLog = inferType<typeof selectActivityLogSchema>;
export type TInsertActivityLog = inferType<typeof insertActivityLogSchema>;
export type TUpdateActivityLog = inferType<typeof updateActivityLogSchema>;
