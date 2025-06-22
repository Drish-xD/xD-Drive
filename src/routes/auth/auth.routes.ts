import { createRoute } from "@hono/zod-openapi";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { createErrorJson, createJson, createMessageSchema } from "@/helpers/schema.helpers";
import { insertUserSchema, loginUserSchema, selectUserSchema } from "@/models";

/**
 * Register User route
 */
export const register = createRoute({
	method: "post",
	path: "/register",
	request: {
		body: createJson({
			description: "Payload to register new user",
			schema: insertUserSchema,
		}),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: MESSAGES.AUTH.REGISTERED,
			schema: selectUserSchema,
		}),
		[HTTP_STATUSES.CONFLICT.CODE]: createErrorJson({
			message: MESSAGES.AUTH.USER_ALREADY_EXISTS,
			status: HTTP_STATUSES.CONFLICT,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
			zodIssueSchema: insertUserSchema,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Auth"],
});

export type TRegisterRoute = typeof register;

/**
 * Login User route
 */
export const login = createRoute({
	method: "post",
	path: "/login",
	request: {
		body: createJson({
			description: "Body to login user",
			schema: loginUserSchema,
		}),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Login User with credentials",
			schema: createMessageSchema({
				example: MESSAGES.AUTH.LOGGED_IN,
			}),
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.AUTH.USER_NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
			zodIssueSchema: loginUserSchema,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Auth"],
});

export type TLoginRoute = typeof login;

/**
 * Refresh Token route
 */
export const refreshToken = createRoute({
	method: "post",
	path: "/refresh-token",
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Refresh Token(s)",
			schema: createMessageSchema({
				example: MESSAGES.AUTH.REFRESHED_TOKEN,
			}),
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
	tags: ["Auth"],
});

export type TRefreshTokenRoute = typeof refreshToken;

/**
 * Logout User route
 */
export const logout = createRoute({
	method: "delete",
	path: "/logout",
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Logout User",
			schema: createMessageSchema({
				example: MESSAGES.AUTH.LOGGED_OUT,
			}),
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Auth"],
});

export type TLogoutRoute = typeof logout;

/**
 * Verify User Email route
 */
export const verifyEmail = createRoute({
	method: "get",
	path: "/verify-email",
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Verify Email",
			schema: createMessageSchema({
				example: MESSAGES.AUTH.EMAIL_VERIFIED,
			}),
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createErrorJson({
			message: MESSAGES.AUTH.USER_NOT_FOUND,
			status: HTTP_STATUSES.NOT_FOUND,
		}),
		[HTTP_STATUSES.CONFLICT.CODE]: createErrorJson({
			message: MESSAGES.AUTH.USER_ALREADY_VERIFIED,
			status: HTTP_STATUSES.CONFLICT,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
	tags: ["Auth"],
});

export type TVerifyEmailRoute = typeof verifyEmail;
