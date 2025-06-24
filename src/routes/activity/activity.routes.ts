import { createRoute } from "@hono/zod-openapi";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { createPaginationQuery, createPaginationResponse } from "@/helpers/pagination.helpers";
import { createErrorJson, createJson, createUuidSchema } from "@/helpers/schema.helpers";
import { selectActivityLogSchema } from "@/models/activityLogs";

export const getUserActivityRoute = createRoute({
	method: "get",
	path: "/activity/user",
	request: {
		query: createPaginationQuery(),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "User activity logs",
			schema: createPaginationResponse(selectActivityLogSchema),
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.ACTIVITY.NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	summary: "Get user activity logs",
	tags: ["Activity"],
});

export const getResourceActivityRoute = createRoute({
	method: "get",
	path: "/activity/resource/:id",
	request: {
		params: createUuidSchema(),
		query: createPaginationQuery(),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Resource activity logs",
			schema: createPaginationResponse(selectActivityLogSchema),
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.ACTIVITY.NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	summary: "Get resource activity logs",
	tags: ["Activity"],
});

export type TGetUserActivityRoute = typeof getUserActivityRoute;
export type TGetResourceActivityRoute = typeof getResourceActivityRoute;
