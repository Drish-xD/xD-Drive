import { db } from "@/db";
import { activityLogs, type activityTypeEnum } from "@/db/schema";

export const logActivity = async ({
	userId,
	resourceId,
	type,
	details = null,
}: {
	userId: string;
	resourceId?: string;
	type: (typeof activityTypeEnum.enumValues)[number];
	details?: Record<string, unknown> | null;
}) => {
	return db.insert(activityLogs).values({
		activityType: type,
		details,
		ipAddress: null,
		resourceId,
		userAgent: null,
		userId,
	});
};
