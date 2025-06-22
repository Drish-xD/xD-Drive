import { createRoute } from "@hono/zod-openapi";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { createPaginationQuery, createPaginationResponse } from "@/helpers/pagination.helpers";
import { createErrorJson, createJson, createMessageSchema, createUuidSchema } from "@/helpers/schema.helpers";
import { selectUserSchema, updateUserSchema } from "@/models";

/**
 * Current User route
 */
export const currentUser = createRoute({
	method: "get",
	path: "/me",
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get current user details",
			schema: selectUserSchema,
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.AUTH.USER_NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Users"],
});

export type TUsersMeRoute = typeof currentUser;

/**
 * Update User route
 */
export const updateCurrentUser = createRoute({
	method: "put",
	path: "/me",
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
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.AUTH.USER_NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Users"],
});

export type TUpdateUserRoute = typeof updateCurrentUser;

/**
 * Delete User route
 */
export const deleteCurrentUser = createRoute({
	method: "delete",
	path: "/me",
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
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.AUTH.USER_NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Users"],
});

export type TDeleteUserRoute = typeof deleteCurrentUser;

/**
 * Users Listing route
 */
export const users = createRoute({
	method: "get",
	path: "/",
	request: {
		query: createPaginationQuery(),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get all users",
			schema: createPaginationResponse(selectUserSchema),
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Users"],
});

export type TUsersRoute = typeof users;

/**
 * User Details route
 */
export const user = createRoute({
	method: "get",
	path: "/:id",
	request: {
		params: createUuidSchema({ description: "User ID" }),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Get a user details",
			schema: selectUserSchema,
		}),
		[HTTP_STATUSES.UNAUTHORIZED.CODE]: createErrorJson({
			message: MESSAGES.AUTH.UNAUTHORIZED,
			status: HTTP_STATUSES.UNAUTHORIZED,
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.AUTH.USER_NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Users"],
});

export type TUserRoute = typeof user;
