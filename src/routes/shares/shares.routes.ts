import { createRoute } from "@hono/zod-openapi";
import { HTTP_STATUSES } from "@/constants";
import { createErrorSchema, createJson, createMessageSchema, createUuidSchema } from "@/helpers/schema.helpers";
import { deleteShareEmailParamSchema, resourcePermissionsSchema, selectResourceShareSchema, shareEmailBodySchema, shareLinkBodySchema, shareTokenParamSchema } from "@/models";

/**
 * Create public share link
 */
export const createShareLink = createRoute({
	method: "post",
	path: "/link/:id",
	request: {
		body: createJson({ description: "Create public share link", schema: shareLinkBodySchema }),
		params: createUuidSchema({ description: "Resource ID" }),
	},
	responses: {
		[HTTP_STATUSES.CREATED.CODE]: createJson({
			description: "Created public share link",
			schema: selectResourceShareSchema,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createJson({ description: "Resource not found", schema: createErrorSchema() }),
		[HTTP_STATUSES.CONFLICT.CODE]: createJson({ description: "Share already exists", schema: createErrorSchema() }),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({ description: "Server error", schema: createErrorSchema() }),
	},
	tags: ["Share"],
});

/**
 * Get resource by public link token
 */
export const getShareLink = createRoute({
	method: "get",
	path: "/link/:token",
	request: { params: shareTokenParamSchema },
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get resource by public link token",
			schema: selectResourceShareSchema,
		}),
		[HTTP_STATUSES.GONE.CODE]: createJson({ description: "Link expired", schema: createErrorSchema() }),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createJson({ description: "Link not found", schema: createErrorSchema() }),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({ description: "Server error", schema: createErrorSchema() }),
	},
	tags: ["Share"],
});

/**
 * Delete public share link
 */
export const deleteShareLink = createRoute({
	method: "delete",
	path: "/link/:token",
	request: { params: shareTokenParamSchema },
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({ description: "Deleted public share link", schema: createMessageSchema({ example: "Share link deleted" }) }),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createJson({ description: "Link not found", schema: createErrorSchema() }),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({ description: "Server error", schema: createErrorSchema() }),
	},
	tags: ["Share"],
});

/**
 * Share resource with user by email
 */
export const createShareEmail = createRoute({
	method: "post",
	path: "/email/:id",
	request: {
		body: createJson({ description: "Share resource with user by email", schema: shareEmailBodySchema }),
		params: createUuidSchema({ description: "Resource ID" }),
	},
	responses: {
		[HTTP_STATUSES.CREATED.CODE]: createJson({
			description: "Created user share",
			schema: selectResourceShareSchema,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createJson({ description: "Resource or user not found", schema: createErrorSchema() }),
		[HTTP_STATUSES.CONFLICT.CODE]: createJson({ description: "Share already exists", schema: createErrorSchema() }),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({ description: "Server error", schema: createErrorSchema() }),
	},
	tags: ["Share"],
});

/**
 * Delete user share
 */
export const deleteShareEmail = createRoute({
	method: "delete",
	path: "/email/:id/:userId",
	request: {
		params: deleteShareEmailParamSchema,
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({ description: "Deleted user share", schema: createMessageSchema({ example: "User share deleted" }) }),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createJson({ description: "Share not found", schema: createErrorSchema() }),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({ description: "Server error", schema: createErrorSchema() }),
	},
	tags: ["Share"],
});

/**
 * Get resource permissions
 */
export const getResourcePermissions = createRoute({
	method: "get",
	path: "/:id/permissions",
	request: { params: createUuidSchema({ description: "Resource ID" }) },
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "List all sharing permissions for a resource",
			schema: resourcePermissionsSchema,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createJson({ description: "Resource not found", schema: createErrorSchema() }),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({ description: "Server error", schema: createErrorSchema() }),
	},
	tags: ["Share"],
});

// Types for handlers
export type TCreateShareLink = typeof createShareLink;
export type TGetShareLink = typeof getShareLink;
export type TDeleteShareLink = typeof deleteShareLink;
export type TCreateShareEmail = typeof createShareEmail;
export type TDeleteShareEmail = typeof deleteShareEmail;
export type TGetResourcePermissions = typeof getResourcePermissions;
