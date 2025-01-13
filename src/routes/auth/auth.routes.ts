import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { insertUserSchema, loginUserSchema, selectUserSchema } from "@/db/schema";
import { createErrorJson, createJson, createMessageSchema } from "@/helpers/schema.helpers";
import { createRoute } from "@hono/zod-openapi";

/**
 * Register User route
 */
export const register = createRoute({
	path: "/register",
	method: "post",
	tags: ["Auth"],
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
			status: HTTP_STATUSES.CONFLICT,
			message: MESSAGES.AUTH.USER_ALREADY_EXISTS,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			zodIssueSchema: insertUserSchema,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TRegisterRoute = typeof register;

/**
 * Login User route
 */
export const login = createRoute({
	path: "/login",
	method: "post",
	tags: ["Auth"],
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
			status: HTTP_STATUSES.NOT_FOUND,
			message: MESSAGES.AUTH.USER_NOT_FOUND,
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createErrorJson({
			status: HTTP_STATUSES.UNPROCESSABLE_ENTITY,
			message: HTTP_STATUSES.UNPROCESSABLE_ENTITY.PHRASE,
			zodIssueSchema: loginUserSchema,
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createErrorJson(),
	},
});

export type TLoginRoute = typeof login;
