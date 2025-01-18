import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { selectUserSchema, updateUserSchema } from "@/db/schema";
import { createPaginationQuery, createPaginationResponse } from "@/helpers/pagination.helpers";
import { createErrorJson, createJson, createMessageSchema, createUuidSchema } from "@/helpers/schema.helpers";
import { createRoute, z } from "@hono/zod-openapi";

/**
 * Current User route
 */
export const me = createRoute({
	path: "/me",
	method: "get",
	tags: ["Users"],
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get current user details",
			schema: selectUserSchema,
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNAUTHORIZED,
			message: MESSAGES.AUTH.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			status: HTTP_STATUSES.NOT_FOUND,
			message: MESSAGES.AUTH.USER_NOT_FOUND,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TUsersMeRoute = typeof me;

/**
 * Users Listing route
 */
export const users = createRoute({
	path: "/",
	method: "get",
	tags: ["Users"],
	request: {
		query: createPaginationQuery(),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get all users",
			schema: createPaginationResponse(selectUserSchema),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNAUTHORIZED,
			message: MESSAGES.AUTH.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TUsersRoute = typeof users;

/**
 * User Details route
 */
export const user = createRoute({
	path: "/:id",
	method: "get",
	tags: ["Users"],
	request: {
		params: createUuidSchema({ description: "User ID" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get a user details",
			schema: selectUserSchema,
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNAUTHORIZED,
			message: MESSAGES.AUTH.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			status: HTTP_STATUSES.NOT_FOUND,
			message: MESSAGES.AUTH.USER_NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TUserRoute = typeof user;

/**
 * Update User route
 */
export const updateUser = createRoute({
	path: "/:id",
	method: "put",
	tags: ["Users"],
	request: {
		params: createUuidSchema({ description: "User ID" }),
		body: createJson({
			description: "Payload to update user",
			schema: updateUserSchema,
		}),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Update user details",
			schema: createMessageSchema({ example: MESSAGES.USER.UPDATED_SUCCESS }).extend({
				data: selectUserSchema,
			}),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNAUTHORIZED,
			message: MESSAGES.AUTH.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			status: HTTP_STATUSES.NOT_FOUND,
			message: MESSAGES.AUTH.USER_NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TUpdateUserRoute = typeof updateUser;

/**
 * Delete User route
 */
export const deleteUser = createRoute({
	path: "/:id",
	method: "delete",
	tags: ["Users"],
	request: {
		params: createUuidSchema({ description: "User ID" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Delete user",
			schema: createMessageSchema({ example: MESSAGES.USER.DELETED_SUCCESS }).extend({
				data: selectUserSchema.pick({
					deletedAt: true,
					id: true,
					status: true,
				}),
			}),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNAUTHORIZED,
			message: MESSAGES.AUTH.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			status: HTTP_STATUSES.NOT_FOUND,
			message: MESSAGES.AUTH.USER_NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			zodIssueSchema: createUuidSchema({ description: "User ID" }),
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TDeleteUserRoute = typeof deleteUser;
