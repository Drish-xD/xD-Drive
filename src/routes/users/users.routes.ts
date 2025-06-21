import { createRoute } from "@hono/zod-openapi";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { createPaginationQuery, createPaginationResponse } from "@/helpers/pagination.helpers";
import { createErrorJson, createJson, createMessageSchema, createUuidSchema } from "@/helpers/schema.helpers";
import { selectUserSchema, updateUserSchema } from "@/models";

/**
 * Current User route
 */
export const currentUser = createRoute({
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

export type TUsersMeRoute = typeof currentUser;

/**
 * Update User route
 */
export const updateCurrentUser = createRoute({
	path: "/me",
	method: "put",
	tags: ["Users"],
	request: {
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

export type TUpdateUserRoute = typeof updateCurrentUser;

/**
 * Delete User route
 */
export const deleteCurrentUser = createRoute({
	path: "/me",
	method: "delete",
	tags: ["Users"],
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
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TDeleteUserRoute = typeof deleteCurrentUser;

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
