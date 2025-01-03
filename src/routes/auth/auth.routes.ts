import { HTTP_STATUSES } from "@/constants";
import { insertUserSchema, loginUserSchema, selectUserSchema } from "@/db/schema";
import { createErrorSchema, createJson } from "@/helpers/schema.helpers";
import { createRoute, z } from "@hono/zod-openapi";

/**
 * Register User route
 */
export const register = createRoute({
	path: "/register",
	method: "post",
	tags: ["Auth"],
	request: {
		body: createJson({
			description: "Body to register new user",
			schema: insertUserSchema,
		}),
	},
	responses: {
		[HTTP_STATUSES.OK.CODE]: createJson({
			description: "Register New User",
			schema: selectUserSchema,
		}),
		[HTTP_STATUSES.CONFLICT.CODE]: createJson({
			description: "User already exists",
			schema: createErrorSchema(),
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createJson({
			description: "Unprocessable Entity",
			schema: createErrorSchema(),
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({
			description: "Internal Server Error",
			schema: createErrorSchema(),
		}),
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
			schema: z.object({
				message: z.string(),
			}),
		}),
		[HTTP_STATUSES.NOT_FOUND.CODE]: createJson({
			description: "User not found",
			schema: createErrorSchema(),
		}),
		[HTTP_STATUSES.UNPROCESSABLE_ENTITY.CODE]: createJson({
			description: "Unprocessable Entity",
			schema: createErrorSchema(),
		}),
		[HTTP_STATUSES.INTERNAL_SERVER_ERROR.CODE]: createJson({
			description: "Internal Server Error",
			schema: createErrorSchema(),
		}),
	},
});

export type TLoginRoute = typeof login;
