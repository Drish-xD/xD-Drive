import { db } from "@/db";
import { type actionTypeEnum, activityLogs, type targetTypeEnum } from "@/db/schema";

export const logActivity = async ({
	id,
	userId,
	resourceId,
	actionType,
	targetType,
	details = null,
}: {
	id: string;
	userId: string;
	resourceId?: string;
	targetType: (typeof targetTypeEnum.enumValues)[number];
	actionType: (typeof actionTypeEnum.enumValues)[number];
	details?: Record<string, unknown> | null;
}) => {
	try {
		return db.insert(activityLogs).values({
			actionType,
			details,
			id,
			ipAddress: null,
			resourceId,
			targetType,
			userAgent: null,
			userId,
		});
	} catch (error) {
		console.error(error);
	}
};
