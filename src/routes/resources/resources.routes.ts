import { createRoute } from "@hono/zod-openapi";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { createPaginationQuery, createPaginationResponse } from "@/helpers/pagination.helpers";
import { createErrorJson, createJson, createUuidSchema } from "@/helpers/schema.helpers";
import { selectResourceSchema } from "@/models";

/**
 * Resources Listing route
 */
export const resources = createRoute({
	method: "get",
	path: "/",
	request: {
		query: createPaginationQuery(),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get all resources",
			schema: createPaginationResponse(selectResourceSchema),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	summary: "Get all resources with pagination",
	tags: ["Resources"],
});

export type TResourcesRoute = typeof resources;

/**
 * Get Resource Children route
 */
export const getResourceChildren = createRoute({
	method: "get",
	path: "/:id/children",
	request: {
		params: createUuidSchema({ description: "Resource ID" }),
		query: createPaginationQuery(),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get a resource children",
			schema: createPaginationResponse(selectResourceSchema),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.RESOURCE.NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	summary: "Get a resource children with pagination",
	tags: ["Resources"],
});

export type TGetResourceChildrenRoute = typeof getResourceChildren;
